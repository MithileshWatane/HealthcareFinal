import { useState, useCallback, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface VoiceBookingState {
    isActive: boolean
    isConnected: boolean
    isListening: boolean
    transcript: string
    status: 'idle' | 'connecting' | 'active' | 'processing' | 'completed' | 'error'
    error: string | null
    bookingDetails: {
        doctor?: string
        specialty?: string
        date?: string
        time?: string
        confirmed?: boolean
    } | null
}

export interface UseVoiceBookingOptions {
    onBookingComplete?: (details: any) => void
    onError?: (error: string) => void
}

export function useVoiceBooking(options: UseVoiceBookingOptions = {}) {
    const [state, setState] = useState<VoiceBookingState>({
        isActive: false,
        isConnected: false,
        isListening: false,
        transcript: '',
        status: 'idle',
        error: null,
        bookingDetails: null,
    })

    const sessionIdRef = useRef<string>('')
    const conversationRef = useRef<any>(null)
    const audioContextRef = useRef<AudioContext | null>(null)

    // Generate unique session ID
    const generateSessionId = useCallback(() => {
        return `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }, [])

    // Start voice booking session
    const startVoiceBooking = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, status: 'connecting', isActive: true }))

            // Generate session ID
            sessionIdRef.current = generateSessionId()

            // Create session in database
            const { error: sessionError } = await supabase
                .from('voice_booking_sessions')
                .insert({
                    session_id: sessionIdRef.current,
                    status: 'in_progress'
                })

            if (sessionError) {
                throw new Error('Failed to create booking session')
            }

            // Get ElevenLabs Agent ID from environment
            const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID

            if (!agentId) {
                throw new Error('ElevenLabs Agent ID not configured. Please add VITE_ELEVENLABS_AGENT_ID to your .env file.')
            }

            // Request microphone permission
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

            // Initialize Audio Context
            audioContextRef.current = new AudioContext()

            // Initialize ElevenLabs Conversation using the Conversational AI Widget approach
            // This uses the ElevenLabs Web SDK for conversational AI
            const { Conversation } = await import('@elevenlabs/client')

            const conversation = await Conversation.startSession({
                agentId: agentId,
                onConnect: () => {
                    console.log('✅ Connected to ElevenLabs')
                    setState(prev => ({
                        ...prev,
                        status: 'active',
                        isConnected: true,
                        isListening: true
                    }))
                },
                onDisconnect: () => {
                    console.log('❌ Disconnected from ElevenLabs')
                    setState(prev => ({
                        ...prev,
                        isConnected: false,
                        isListening: false
                    }))
                },
                onMessage: (message: any) => {
                    console.log('📨 Message:', message)

                    // Handle different message types
                    if (message.message?.role === 'user') {
                        // User spoke
                        setState(prev => ({
                            ...prev,
                            transcript: prev.transcript + `\n\n**You:** ${message.message.content}`
                        }))
                    } else if (message.message?.role === 'assistant') {
                        // Agent responded
                        setState(prev => ({
                            ...prev,
                            transcript: prev.transcript + `\n\n**Agent:** ${message.message.content}`
                        }))
                    }

                    // Handle tool calls
                    if (message.type === 'tool_call' || message.tool_call) {
                        handleToolCall(message)
                    }
                },
                onError: (error: any) => {
                    console.error('❌ ElevenLabs error:', error)
                    const errorMessage = typeof error === 'string' ? error : error?.message || 'Voice connection error'
                    setState(prev => ({
                        ...prev,
                        status: 'error',
                        error: errorMessage,
                        isActive: false
                    }))
                    options.onError?.(errorMessage)
                },
            })

            conversationRef.current = conversation

            // Clean up stream
            stream.getTracks().forEach(track => track.stop())

        } catch (error: any) {
            console.error('❌ Error starting voice booking:', error)
            const errorMessage = error.message || 'Failed to start voice booking'
            setState(prev => ({
                ...prev,
                status: 'error',
                error: errorMessage,
                isActive: false
            }))
            options.onError?.(errorMessage)
        }
    }, [generateSessionId, options])

    // Handle tool calls from ElevenLabs
    const handleToolCall = useCallback((message: any) => {
        console.log('🔧 Tool call:', message)

        const toolCall = message.tool_call || message
        const toolName = toolCall.name || toolCall.tool_name
        const parameters = toolCall.parameters || toolCall.arguments

        if (toolName === 'checkAvailability') {
            // Update UI to show checking availability
            setState(prev => ({
                ...prev,
                status: 'processing',
                bookingDetails: {
                    ...prev.bookingDetails,
                    date: parameters.date,
                    time: parameters.time
                }
            }))
        } else if (toolName === 'bookAppointment') {
            // Update UI with booking details
            setState(prev => ({
                ...prev,
                status: 'processing',
                bookingDetails: {
                    doctor: parameters.doctor_name,
                    specialty: parameters.specialty,
                    date: parameters.date,
                    time: parameters.time,
                    confirmed: false
                }
            }))
        }
    }, [])

    // Stop voice booking session
    const stopVoiceBooking = useCallback(async () => {
        try {
            // End ElevenLabs conversation
            if (conversationRef.current) {
                try {
                    await conversationRef.current.endSession()
                } catch (error) {
                    console.error('Error ending conversation:', error)
                }
                conversationRef.current = null
            }

            // Close audio context
            if (audioContextRef.current) {
                await audioContextRef.current.close()
                audioContextRef.current = null
            }

            if (sessionIdRef.current) {
                // Update session status
                await supabase
                    .from('voice_booking_sessions')
                    .update({
                        status: state.status === 'completed' ? 'completed' : 'cancelled',
                        conversation_transcript: state.transcript
                    })
                    .eq('session_id', sessionIdRef.current)
            }

            setState({
                isActive: false,
                isConnected: false,
                isListening: false,
                transcript: '',
                status: 'idle',
                error: null,
                bookingDetails: null,
            })

            sessionIdRef.current = ''

        } catch (error: any) {
            console.error('Error stopping voice booking:', error)
        }
    }, [state.status, state.transcript])

    // Update transcript manually (for testing or additional messages)
    const updateTranscript = useCallback((text: string) => {
        setState(prev => ({
            ...prev,
            transcript: prev.transcript + ' ' + text
        }))
    }, [])

    // Update booking details
    const updateBookingDetails = useCallback((details: Partial<VoiceBookingState['bookingDetails']>) => {
        setState(prev => ({
            ...prev,
            bookingDetails: {
                ...prev.bookingDetails,
                ...details
            }
        }))
    }, [])

    // Complete booking
    const completeBooking = useCallback((details: any) => {
        setState(prev => ({
            ...prev,
            status: 'completed',
            bookingDetails: {
                ...prev.bookingDetails,
                ...details,
                confirmed: true
            }
        }))
        options.onBookingComplete?.(details)
    }, [options])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (state.isActive && conversationRef.current) {
                conversationRef.current.endSession?.()
            }
            if (audioContextRef.current) {
                audioContextRef.current.close()
            }
        }
    }, [state.isActive])

    return {
        state,
        sessionId: sessionIdRef.current,
        startVoiceBooking,
        stopVoiceBooking,
        updateTranscript,
        updateBookingDetails,
        completeBooking,
    }
}
