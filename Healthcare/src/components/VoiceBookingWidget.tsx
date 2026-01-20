import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, PhoneOff, Mic, MicOff, Volume2, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useVoiceBooking } from '@/hooks/useVoiceBooking'
import { cn } from '@/lib/utils'

interface VoiceBookingWidgetProps {
    isOpen: boolean
    onClose: () => void
    onBookingComplete?: (details: any) => void
}

export function VoiceBookingWidget({ isOpen, onClose, onBookingComplete }: VoiceBookingWidgetProps) {
    const {
        state,
        startVoiceBooking,
        stopVoiceBooking,
    } = useVoiceBooking({
        onBookingComplete: (details) => {
            onBookingComplete?.(details)
        },
    })

    const [isMuted, setIsMuted] = useState(false)

    useEffect(() => {
        if (isOpen && state.status === 'idle') {
            startVoiceBooking()
        }
    }, [isOpen, state.status, startVoiceBooking])

    const handleClose = () => {
        stopVoiceBooking()
        onClose()
    }

    const toggleMute = () => {
        setIsMuted(!isMuted)
        // Implement actual mute functionality with voice AI SDK
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={handleClose}
                    />

                    {/* Widget */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
                    >
                        <div className="bg-card rounded-3xl shadow-2xl border border-border overflow-hidden">
                            {/* Header */}
                            <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border-b border-border">
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center",
                                        state.isListening ? "bg-primary animate-pulse" : "bg-muted"
                                    )}>
                                        <Phone className="w-6 h-6 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-lg">Voice Booking</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {state.status === 'connecting' && 'Connecting...'}
                                            {state.status === 'active' && 'Listening...'}
                                            {state.status === 'processing' && 'Processing...'}
                                            {state.status === 'completed' && 'Booking Confirmed!'}
                                            {state.status === 'error' && 'Connection Error'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                {/* Status Messages */}
                                {state.status === 'error' && (
                                    <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-destructive">Connection Error</p>
                                            <p className="text-sm text-destructive/80 mt-1">{state.error}</p>
                                        </div>
                                    </div>
                                )}

                                {state.status === 'completed' && (
                                    <div className="flex items-start gap-3 p-4 bg-success/10 border border-success/20 rounded-xl">
                                        <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-success">Booking Confirmed!</p>
                                            <p className="text-sm text-success/80 mt-1">
                                                Your appointment has been successfully booked.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Booking Details */}
                                {state.bookingDetails && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm text-muted-foreground">Booking Details</h4>
                                        <div className="space-y-2">
                                            {state.bookingDetails.doctor && (
                                                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                                    <span className="text-sm text-muted-foreground">Doctor</span>
                                                    <span className="font-medium">{state.bookingDetails.doctor}</span>
                                                </div>
                                            )}
                                            {state.bookingDetails.specialty && (
                                                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                                    <span className="text-sm text-muted-foreground">Specialty</span>
                                                    <span className="font-medium">{state.bookingDetails.specialty}</span>
                                                </div>
                                            )}
                                            {state.bookingDetails.date && (
                                                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                                    <span className="text-sm text-muted-foreground">Date</span>
                                                    <span className="font-medium">{state.bookingDetails.date}</span>
                                                </div>
                                            )}
                                            {state.bookingDetails.time && (
                                                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                                    <span className="text-sm text-muted-foreground">Time</span>
                                                    <span className="font-medium">{state.bookingDetails.time}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Transcript */}
                                {state.transcript && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm text-muted-foreground">Conversation</h4>
                                        <div className="p-4 bg-muted rounded-lg max-h-40 overflow-y-auto">
                                            <p className="text-sm leading-relaxed">{state.transcript}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Voice Waveform Visualization */}
                                {state.isListening && !state.transcript && (
                                    <div className="flex items-center justify-center gap-1 h-20">
                                        {[...Array(5)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="w-1 bg-primary rounded-full"
                                                animate={{
                                                    height: ['20%', '100%', '20%'],
                                                }}
                                                transition={{
                                                    duration: 0.8,
                                                    repeat: Infinity,
                                                    delay: i * 0.1,
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Instructions */}
                                {state.status === 'active' && !state.transcript && (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-muted-foreground">
                                            Start speaking to book your appointment...
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Tell us which doctor you'd like to see and your preferred date and time
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer Controls */}
                            <div className="p-6 border-t border-border bg-muted/30">
                                <div className="flex items-center justify-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="w-12 h-12 rounded-full"
                                        onClick={toggleMute}
                                        disabled={!state.isActive}
                                    >
                                        {isMuted ? (
                                            <MicOff className="w-5 h-5" />
                                        ) : (
                                            <Mic className="w-5 h-5" />
                                        )}
                                    </Button>

                                    <Button
                                        variant={state.isActive ? "destructive" : "default"}
                                        size="icon"
                                        className="w-16 h-16 rounded-full"
                                        onClick={state.isActive ? handleClose : startVoiceBooking}
                                    >
                                        {state.isActive ? (
                                            <PhoneOff className="w-6 h-6" />
                                        ) : (
                                            <Phone className="w-6 h-6" />
                                        )}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="w-12 h-12 rounded-full"
                                        disabled
                                    >
                                        <Volume2 className="w-5 h-5" />
                                    </Button>
                                </div>

                                <p className="text-xs text-center text-muted-foreground mt-4">
                                    {state.isActive ? 'Tap the red button to end the call' : 'Tap to start voice booking'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
