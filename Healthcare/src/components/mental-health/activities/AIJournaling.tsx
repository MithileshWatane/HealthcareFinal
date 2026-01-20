import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { saveJournalEntry } from '@/services/guidedActivityService';

const JOURNAL_PROMPTS = [
    "What worried you most today?",
    "What made you feel safe or secure today?",
    "What are you grateful for right now?",
    "What challenge did you face today and how did you handle it?",
    "What emotion dominated your day and why?",
    "What would you tell your future self about today?",
    "What do you need to let go of?",
    "What brought you joy or peace today?",
];

interface AIJournalingProps {
    userId?: string;
    onComplete?: () => void;
}

export function AIJournaling({ userId, onComplete }: AIJournalingProps) {
    const [currentPrompt, setCurrentPrompt] = useState(JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)]);
    const [entryText, setEntryText] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const getNewPrompt = () => {
        const newPrompt = JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
        setCurrentPrompt(newPrompt);
    };

    const handleSave = async () => {
        if (!userId) {
            toast({
                title: "Please sign in",
                description: "You need to be signed in to save your journal entry",
                variant: "destructive"
            });
            return;
        }

        if (!entryText.trim()) {
            toast({
                title: "Empty entry",
                description: "Please write something before saving",
                variant: "destructive"
            });
            return;
        }

        setIsSaving(true);

        try {
            await saveJournalEntry({
                user_id: userId,
                prompt_text: currentPrompt,
                entry_text: entryText,
                word_count: entryText.trim().split(/\s+/).length
            });

            toast({
                title: "Entry Saved!",
                description: "Your journal entry has been recorded"
            });

            setEntryText('');
            getNewPrompt();
            onComplete?.();
        } catch (error) {
            console.error('Error saving journal entry:', error);
            toast({
                title: "Error",
                description: "Failed to save your entry. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-purple/10 rounded-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-purple" />
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground">
                    AI-Guided Journaling
                </h3>
                <p className="text-sm text-muted-foreground">
                    Reflect on your thoughts and feelings
                </p>
            </div>

            <div className="bg-gradient-to-br from-purple/10 to-primary/10 rounded-xl p-6 border border-purple/20">
                <div className="flex items-start gap-3 mb-4">
                    <Sparkles className="w-5 h-5 text-purple mt-1" />
                    <div>
                        <p className="text-sm font-medium text-foreground mb-1">Today's Prompt</p>
                        <p className="text-lg font-semibold text-foreground">{currentPrompt}</p>
                    </div>
                </div>
                <Button
                    onClick={getNewPrompt}
                    variant="ghost"
                    size="sm"
                    className="text-purple hover:text-purple/80"
                >
                    Get different prompt
                </Button>
            </div>

            <div className="space-y-2">
                <Textarea
                    value={entryText}
                    onChange={(e) => setEntryText(e.target.value)}
                    placeholder="Start writing your thoughts..."
                    className="min-h-48 resize-none"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{entryText.trim().split(/\s+/).filter(w => w).length} words</span>
                    <span>{entryText.length} characters</span>
                </div>
            </div>

            <Button
                onClick={handleSave}
                disabled={isSaving || !entryText.trim()}
                className="w-full gradient-mental text-primary-foreground"
                size="lg"
            >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Entry'}
            </Button>

            <div className="bg-muted rounded-xl p-4">
                <p className="text-xs text-muted-foreground">
                    💡 <strong>Why journal?</strong> Journaling helps process emotions, identify patterns, and reduce rumination.
                </p>
            </div>
        </motion.div>
    );
}
