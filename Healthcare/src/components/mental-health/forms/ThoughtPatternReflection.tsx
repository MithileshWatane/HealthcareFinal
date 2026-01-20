import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { saveThoughtPattern } from '@/services/dailyCheckInService';

interface ThoughtPatternReflectionProps {
    userId?: string;
    onComplete?: () => void;
}

export function ThoughtPatternReflection({ userId, onComplete }: ThoughtPatternReflectionProps) {
    const [thoughtText, setThoughtText] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleSave = async () => {
        if (!userId) {
            toast({
                title: "Please sign in",
                description: "You need to be signed in to save your reflection",
                variant: "destructive"
            });
            return;
        }

        if (!thoughtText.trim()) {
            toast({
                title: "Empty reflection",
                description: "Please write something before saving",
                variant: "destructive"
            });
            return;
        }

        setIsSaving(true);

        try {
            await saveThoughtPattern({
                user_id: userId,
                thought_text: thoughtText
            });

            toast({
                title: "Reflection Saved!",
                description: "Your thought pattern has been recorded"
            });

            setThoughtText('');
            onComplete?.();
        } catch (error) {
            console.error('Error saving thought pattern:', error);
            toast({
                title: "Error",
                description: "Failed to save your reflection. Please try again.",
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
                    <MessageSquare className="w-8 h-8 text-purple" />
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground">
                    Thought Pattern Reflection
                </h3>
                <p className="text-sm text-muted-foreground">
                    What thought has been repeating in your mind today?
                </p>
            </div>

            <div className="space-y-4">
                <Textarea
                    value={thoughtText}
                    onChange={(e) => setThoughtText(e.target.value)}
                    placeholder="Write about a recurring thought or worry..."
                    className="min-h-32 resize-none"
                />

                <div className="text-xs text-muted-foreground text-right">
                    {thoughtText.length} characters
                </div>
            </div>

            <div className="bg-muted rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">Reflection Prompts:</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• What thought kept coming back today?</li>
                    <li>• Is there something you can't stop thinking about?</li>
                    <li>• What worries or concerns are on your mind?</li>
                    <li>• What positive thoughts did you have?</li>
                </ul>
            </div>

            <Button
                onClick={handleSave}
                disabled={isSaving || !thoughtText.trim()}
                className="w-full gradient-mental text-primary-foreground"
                size="lg"
            >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Reflection'}
            </Button>

            <div className="bg-muted rounded-xl p-4">
                <p className="text-xs text-muted-foreground">
                    💡 <strong>Why track thoughts?</strong> Identifying thought patterns helps detect rumination and cognitive distortions.
                </p>
            </div>
        </motion.div>
    );
}
