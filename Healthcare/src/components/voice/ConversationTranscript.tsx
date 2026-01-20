import { ScrollArea } from '@/components/ui/scroll-area';
import { ConversationMessage } from '@/types/voiceConsultation.types';
import { User, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface ConversationTranscriptProps {
    messages: ConversationMessage[];
    doctorName: string;
}

export function ConversationTranscript({
    messages,
    doctorName,
}: ConversationTranscriptProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Conversation will appear here...</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-full pr-4" ref={scrollRef}>
            <div className="space-y-4">
                {messages.map((message, index) => (
                    <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-3"
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.speaker === 'doctor'
                                    ? 'bg-primary/10'
                                    : 'bg-muted'
                                }`}
                        >
                            {message.speaker === 'doctor' ? (
                                <Stethoscope className="w-4 h-4 text-primary" />
                            ) : (
                                <User className="w-4 h-4 text-muted-foreground" />
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-foreground">
                                    {message.speaker === 'doctor' ? doctorName : 'You'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {message.text}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </ScrollArea>
    );
}
