import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ConsultationState } from '@/types/voiceConsultation.types';

interface VoiceConversationInterfaceProps {
    state: ConsultationState;
    onStartListening: () => void;
    onStopListening: () => void;
    doctorName: string;
}

export function VoiceConversationInterface({
    state,
    onStartListening,
    onStopListening,
    doctorName,
}: VoiceConversationInterfaceProps) {
    const [audioLevel, setAudioLevel] = useState<number[]>([]);

    // Generate random audio levels for visualization
    useEffect(() => {
        if (state.isListening || state.isSpeaking) {
            const interval = setInterval(() => {
                setAudioLevel(
                    Array.from({ length: 20 }, () => Math.random() * 40 + 8)
                );
            }, 100);
            return () => clearInterval(interval);
        } else {
            setAudioLevel([]);
        }
    }, [state.isListening, state.isSpeaking]);

    return (
        <div className="flex flex-col items-center py-8 space-y-6">
            {/* Main Control Button */}
            <motion.button
                onClick={state.isListening ? onStopListening : onStartListening}
                disabled={state.isSpeaking}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    'w-32 h-32 rounded-full flex items-center justify-center transition-all relative',
                    state.isListening
                        ? 'bg-destructive shadow-lg shadow-destructive/30'
                        : state.isSpeaking
                            ? 'bg-primary/50 cursor-not-allowed'
                            : 'gradient-primary shadow-lg shadow-primary/30'
                )}
            >
                {state.isSpeaking ? (
                    <Volume2 className="w-12 h-12 text-primary-foreground animate-pulse" />
                ) : state.isListening ? (
                    <MicOff className="w-12 h-12 text-destructive-foreground" />
                ) : (
                    <Mic className="w-12 h-12 text-primary-foreground" />
                )}

                {/* Pulse animation when listening */}
                {state.isListening && (
                    <>
                        <motion.div
                            className="absolute inset-0 rounded-full bg-destructive"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 0, 0.5],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                        <motion.div
                            className="absolute inset-0 rounded-full bg-destructive"
                            animate={{
                                scale: [1, 1.4, 1],
                                opacity: [0.3, 0, 0.3],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: 0.5,
                            }}
                        />
                    </>
                )}
            </motion.button>

            {/* Status Text */}
            <div className="text-center min-h-[60px]">
                {state.isSpeaking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Volume2 className="w-5 h-5 text-primary animate-pulse" />
                            <span className="text-primary font-medium">
                                {doctorName} is speaking...
                            </span>
                        </div>
                        <Loader2 className="w-4 h-4 animate-spin mx-auto text-primary" />
                    </motion.div>
                )}

                {state.isListening && !state.isSpeaking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <span className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                            <span className="text-destructive font-medium">Listening...</span>
                        </div>
                        {state.currentMessage && (
                            <p className="text-sm text-muted-foreground italic">
                                "{state.currentMessage}"
                            </p>
                        )}
                    </motion.div>
                )}

                {!state.isListening && !state.isSpeaking && state.isActive && (
                    <p className="text-muted-foreground">
                        Click the microphone to speak with {doctorName}
                    </p>
                )}

                {!state.isActive && (
                    <p className="text-muted-foreground">
                        Start your consultation to begin
                    </p>
                )}

                {state.error && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-destructive text-sm"
                    >
                        {state.error}
                    </motion.p>
                )}
            </div>

            {/* Audio Visualization */}
            {(state.isListening || state.isSpeaking) && audioLevel.length > 0 && (
                <div className="flex items-center justify-center gap-1 h-16">
                    {audioLevel.map((height, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                height: `${height}px`,
                            }}
                            transition={{
                                duration: 0.1,
                            }}
                            className={cn(
                                'w-1 rounded-full',
                                state.isSpeaking ? 'bg-primary' : 'bg-destructive'
                            )}
                        />
                    ))}
                </div>
            )}

            {/* Instructions */}
            {state.isActive && !state.isListening && !state.isSpeaking && (
                <div className="text-center max-w-md">
                    <p className="text-sm text-muted-foreground">
                        Press and hold the microphone button to speak. Release when you're done.
                        The doctor will respond automatically.
                    </p>
                </div>
            )}
        </div>
    );
}
