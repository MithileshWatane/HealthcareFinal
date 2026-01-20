import { GoogleGenerativeAI } from '@google/generative-ai';
import { DoctorSpecialty, ConversationMessage } from '@/types/voiceConsultation.types';
import { getSystemPrompt } from './doctorPersonaService';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const isValidKey = apiKey && apiKey !== 'your_gemini_api_key_here';
const genAI = isValidKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Generate doctor response based on specialty and conversation history
 */
export async function generateDoctorResponse(
    specialty: DoctorSpecialty,
    conversationHistory: ConversationMessage[],
    userMessage: string
): Promise<string> {
    if (!genAI) {
        return "I apologize, but the AI service is not configured. Please check your API key.";
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
        const systemPrompt = getSystemPrompt(specialty);

        // Build conversation history
        const history = conversationHistory.map((msg) => ({
            role: msg.speaker === 'doctor' ? 'model' : 'user',
            parts: [{ text: msg.text }],
        }));

        // Start chat with system prompt and history
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: 'model',
                    parts: [
                        {
                            text: 'I understand my role and will conduct this consultation professionally, empathetically, and according to the guidelines provided.',
                        },
                    ],
                },
                ...history,
            ],
            generationConfig: {
                maxOutputTokens: 2048,
                temperature: 0.8,
                topP: 0.9,
                topK: 40,
            },
        });

        // Send user message and get response
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating doctor response:', error);
        return "I apologize, but I'm having trouble processing your message right now. Could you please repeat that?";
    }
}
