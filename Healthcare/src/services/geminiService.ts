import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Allow the key if it exists and is NOT the specific placeholder
const isValidKey = apiKey && apiKey !== 'your_gemini_api_key_here';
const genAI = isValidKey ? new GoogleGenerativeAI(apiKey) : null;
const GEMINI_MODEL = 'gemini-3-flash-preview';

// System prompt for medical Q&A
const MEDICAL_SYSTEM_PROMPT = `You are a helpful and knowledgeable medical AI assistant. Your role is to:

1. Provide accurate, evidence-based health information
2. Help users understand common symptoms and conditions
3. Offer general wellness advice and preventive care tips
4. Guide users on when to seek professional medical care
5. Be empathetic and supportive

IMPORTANT GUIDELINES:
- Always emphasize that you provide general information, not medical diagnosis
- Recommend consulting healthcare professionals for specific medical concerns
- Never prescribe medications or treatments
- Be clear about the limitations of AI medical advice
- If a question involves serious symptoms, urge immediate medical attention
- Maintain patient privacy and confidentiality
- Use simple, easy-to-understand language
- Be supportive and non-judgmental

Format your responses in a clear, organized manner. Use bullet points when listing symptoms or recommendations.`;

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

/**
 * Send a message to Gemini AI and get a response
 */
export async function sendMessageToGemini(
    message: string,
    conversationHistory: ChatMessage[] = []
): Promise<string> {
    if (!genAI) {
        const errorMsg = "❌ Gemini API key is not configured in .env file. Please check VITE_GEMINI_API_KEY.";
        console.error(errorMsg);
        return errorMsg;
    }

    try {
        // Use Gemini Pro model
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

        // Build conversation history for context
        const history = conversationHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }));

        // Start chat with history
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: MEDICAL_SYSTEM_PROMPT }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'I understand. I will act as a helpful medical AI assistant, providing general health information while emphasizing the importance of consulting healthcare professionals for specific medical concerns. I will be empathetic, accurate, and clear about my limitations.' }],
                },
                ...history,
            ],
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
            },
        });

        // Send message and get response
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error: any) {
        console.error('Error calling Gemini API:', error);

        if (error.message?.includes('API key')) {
            return "I apologize, but there's an issue with the API configuration. Please check your Gemini API key.";
        }

        if (error.message?.includes('quota')) {
            return "I apologize, but the API quota has been exceeded. Please try again later.";
        }

        return "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
    }
}

/**
 * Get quick health tips
 */
export async function getHealthTip(): Promise<string> {
    if (!genAI) {
        return "Stay hydrated, eat a balanced diet, exercise regularly, and get enough sleep!";
    }

    try {
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

        const prompt = "Provide a brief, actionable health tip (2-3 sentences) for general wellness. Make it practical and easy to implement.";

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error getting health tip:', error);
        return "Stay hydrated, eat a balanced diet, exercise regularly, and get enough sleep!";
    }
}

/**
 * Analyze symptoms and provide guidance
 */
export async function analyzeSymptoms(symptoms: string[]): Promise<string> {
    if (!genAI) {
        return "Please consult a healthcare professional for symptom analysis.";
    }

    try {
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

        const prompt = `A person is experiencing the following symptoms: ${symptoms.join(', ')}. 

Please provide:
1. Possible common causes (general information only)
2. Self-care recommendations
3. When to seek medical attention
4. Important disclaimer about consulting a healthcare professional

Keep the response clear, concise, and emphasize the importance of professional medical advice.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error analyzing symptoms:', error);
        return "I recommend consulting a healthcare professional for a proper evaluation of your symptoms.";
    }
}


