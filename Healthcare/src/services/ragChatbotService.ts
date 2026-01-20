// Service for RAG Chatbot Backend (Flask + Groq)
const RAG_API_URL = 'http://localhost:5000';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

/**
 * Send a message to the RAG chatbot backend
 */
export async function sendMessageToRAG(message: string): Promise<string> {
    try {
        const response = await fetch(`${RAG_API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please wait a moment and try again.');
            }

            throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to get response from chatbot');
        }

        return data.response;
    } catch (error: any) {
        console.error('Error calling RAG API:', error);

        // Network errors
        if (error.message?.includes('fetch')) {
            return "❌ Cannot connect to the chatbot server. Please make sure the Flask backend is running on http://localhost:5000";
        }

        // Rate limit errors
        if (error.message?.includes('rate limit') || error.message?.includes('429')) {
            return "⏳ You've reached the rate limit. Please wait a moment before sending another message.";
        }

        // Return the error message or a generic one
        return error.message || "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
    }
}

/**
 * Check if the RAG backend is running
 */
export async function checkRAGBackendStatus(): Promise<boolean> {
    try {
        const response = await fetch(`${RAG_API_URL}/`, {
            method: 'GET',
        });
        return response.ok;
    } catch (error) {
        console.error('RAG backend is not running:', error);
        return false;
    }
}
