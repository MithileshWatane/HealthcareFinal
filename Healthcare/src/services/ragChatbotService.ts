// Service for Medical Chatbot using Gemini API
import { sendMessageToGemini, ChatMessage as GeminiChatMessage } from './geminiService';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

// Store conversation history for context-aware responses
let conversationHistory: GeminiChatMessage[] = [];

/**
 * Send a message to the Gemini AI chatbot
 * @param message - The user's message
 * @param history - Optional conversation history for context
 */
export async function sendMessageToRAG(
    message: string,
    history?: ChatMessage[]
): Promise<string> {
    try {
        // Convert history to Gemini format if provided
        const contextHistory: GeminiChatMessage[] = history
            ? history.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
            : conversationHistory;

        // Send message to Gemini API with conversation context
        const response = await sendMessageToGemini(message, contextHistory);

        // Update conversation history
        conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: response }
        );

        // Keep history manageable (last 10 exchanges = 20 messages)
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

        return response;
    } catch (error: any) {
        console.error('Error calling Gemini API:', error);

        // Handle specific error cases
        if (error.message?.includes('API key')) {
            return "❌ Gemini API key is not configured properly. Please check your environment settings.";
        }

        if (error.message?.includes('quota') || error.message?.includes('429')) {
            return "⏳ API quota exceeded. Please wait a moment before sending another message.";
        }

        // Return the error message or a generic one
        return error.message || "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
    }
}

/**
 * Reset conversation history (useful for new chat sessions)
 */
export function resetConversationHistory(): void {
    conversationHistory = [];
}

/**
 * Check if the Gemini API is configured
 */
export async function checkRAGBackendStatus(): Promise<boolean> {
    // Check if API key is configured
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    return !!(apiKey && apiKey !== 'your_gemini_api_key_here');
}
