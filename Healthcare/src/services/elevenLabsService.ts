import { DoctorSpecialty } from '@/types/voiceConsultation.types';

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

// Voice IDs for different doctor personas (using ElevenLabs pre-made voices)
// You can customize these with specific voice IDs from your ElevenLabs account
const VOICE_MAPPING: Record<DoctorSpecialty, string> = {
    [DoctorSpecialty.GENERAL_PRACTITIONER]: 'EXAVITQu4vr4xnSDxMaL', // Sarah - warm female voice
    [DoctorSpecialty.CARDIOLOGIST]: 'VR6AewLTigWG4xSOukaG', // James - professional male voice
    [DoctorSpecialty.DERMATOLOGIST]: 'jsCqWAovK2LkecY7zXl4', // Emily - friendly female voice
    [DoctorSpecialty.NEUROLOGIST]: 'onwK4e9ZLuTAKqWW03F9', // Michael - calm male voice
    [DoctorSpecialty.PEDIATRICIAN]: 'ThT5KcBeYPX3keUQqHPh', // Lisa - gentle female voice
    [DoctorSpecialty.PSYCHIATRIST]: 'pNInz6obpgDQGcFmaJgB', // David - soothing male voice
};

/**
 * Initialize ElevenLabs (check if API key is configured)
 */
export function isElevenLabsConfigured(): boolean {
    return !!ELEVENLABS_API_KEY && ELEVENLABS_API_KEY !== 'your_elevenlabs_api_key_here';
}

/**
 * Get voice ID for a specific specialty
 */
export function getVoiceForSpecialty(specialty: DoctorSpecialty): string {
    return VOICE_MAPPING[specialty];
}

/**
 * Convert text to speech using ElevenLabs API
 */
export async function textToSpeech(
    text: string,
    voiceId: string
): Promise<Blob | null> {
    if (!isElevenLabsConfigured()) {
        console.error('ElevenLabs API key not configured');
        return null;
    }

    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY,
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_flash_v2_5',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs API error:', errorText);
            return null;
        }

        const audioBlob = await response.blob();
        return audioBlob;
    } catch (error) {
        console.error('Error in text-to-speech:', error);
        return null;
    }
}

/**
 * Convert speech to text using Web Speech API (browser native)
 * This is a fallback/primary method since it's free and works well
 */
export function startSpeechRecognition(
    onResult: (transcript: string) => void,
    onError: (error: string) => void
): SpeechRecognition | null {
    // Check if browser supports Speech Recognition
    const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.error('Speech recognition not supported in this browser');
        onError('Speech recognition is not supported in your browser');
        return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }

        if (finalTranscript) {
            onResult(finalTranscript.trim());
        }
    };

    recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        onError(`Speech recognition error: ${event.error}`);
    };

    recognition.onend = () => {
        console.log('Speech recognition ended');
    };

    try {
        recognition.start();
        return recognition;
    } catch (error) {
        console.error('Error starting speech recognition:', error);
        onError('Failed to start speech recognition');
        return null;
    }
}

/**
 * Stop speech recognition
 */
export function stopSpeechRecognition(recognition: SpeechRecognition | null): void {
    if (recognition) {
        recognition.stop();
    }
}

/**
 * Play audio blob
 */
export function playAudio(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            resolve();
        };

        audio.onerror = (error) => {
            URL.revokeObjectURL(audioUrl);
            reject(error);
        };

        audio.play().catch(reject);
    });
}

/**
 * Get available audio input devices
 */
export async function getAudioDevices(): Promise<MediaDeviceInfo[]> {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter((device) => device.kind === 'audioinput');
    } catch (error) {
        console.error('Error getting audio devices:', error);
        return [];
    }
}

/**
 * Request microphone permission
 */
export async function requestMicrophonePermission(): Promise<boolean> {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop the stream immediately, we just needed permission
        stream.getTracks().forEach((track) => track.stop());
        return true;
    } catch (error) {
        console.error('Microphone permission denied:', error);
        return false;
    }
}
