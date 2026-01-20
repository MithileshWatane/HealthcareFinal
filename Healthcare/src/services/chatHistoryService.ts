import { supabase } from '@/lib/supabase';

export interface ChatMessage {
    id: string;
    session_id: string;
    user_id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

export interface ChatSession {
    id: string;
    user_id: string;
    title: string | null;
    created_at: string;
    updated_at: string;
}

export interface ChatSessionWithStats {
    id: string;
    title: string | null;
    message_count: number;
    last_message_at: string;
    created_at: string;
}

class ChatHistoryService {
    /**
     * Create a new chat session
     */
    async createSession(userId: string, title?: string): Promise<ChatSession> {
        try {
            const { data, error } = await supabase
                .from('chat_sessions')
                .insert({
                    user_id: userId,
                    title: title || null,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating chat session:', error);
            throw error;
        }
    }

    /**
     * Get all chat sessions for a user
     */
    async getUserSessions(userId: string, limit: number = 10): Promise<ChatSessionWithStats[]> {
        try {
            const { data, error } = await supabase
                .rpc('get_user_chat_sessions', {
                    p_user_id: userId,
                    p_limit: limit,
                });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching user sessions:', error);
            throw error;
        }
    }

    /**
     * Get a specific chat session
     */
    async getSession(sessionId: string): Promise<ChatSession | null> {
        try {
            const { data, error } = await supabase
                .from('chat_sessions')
                .select('*')
                .eq('id', sessionId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching session:', error);
            throw error;
        }
    }

    /**
     * Update a chat session title
     */
    async updateSessionTitle(sessionId: string, title: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('chat_sessions')
                .update({ title })
                .eq('id', sessionId);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating session title:', error);
            throw error;
        }
    }

    /**
     * Delete a chat session (will cascade delete all messages)
     */
    async deleteSession(sessionId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('chat_sessions')
                .delete()
                .eq('id', sessionId);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting session:', error);
            throw error;
        }
    }

    /**
     * Save a message to a session
     */
    async saveMessage(
        sessionId: string,
        userId: string,
        role: 'user' | 'assistant',
        content: string
    ): Promise<ChatMessage> {
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .insert({
                    session_id: sessionId,
                    user_id: userId,
                    role,
                    content,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error saving message:', error);
            throw error;
        }
    }

    /**
     * Get all messages for a session
     */
    async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching session messages:', error);
            throw error;
        }
    }

    /**
     * Delete a specific message
     */
    async deleteMessage(messageId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('chat_messages')
                .delete()
                .eq('id', messageId);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    }

    /**
     * Get the most recent session for a user, or create a new one
     */
    async getOrCreateCurrentSession(userId: string): Promise<ChatSession> {
        try {
            // Try to get the most recent session
            const { data: sessions, error: fetchError } = await supabase
                .from('chat_sessions')
                .select('*')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false })
                .limit(1);

            if (fetchError) throw fetchError;

            // If a recent session exists, return it
            if (sessions && sessions.length > 0) {
                return sessions[0];
            }

            // Otherwise, create a new session
            return await this.createSession(userId);
        } catch (error) {
            console.error('Error getting or creating current session:', error);
            throw error;
        }
    }

    /**
     * Clear all messages from a session (but keep the session)
     */
    async clearSessionMessages(sessionId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('chat_messages')
                .delete()
                .eq('session_id', sessionId);

            if (error) throw error;
        } catch (error) {
            console.error('Error clearing session messages:', error);
            throw error;
        }
    }
}

export const chatHistoryService = new ChatHistoryService();
