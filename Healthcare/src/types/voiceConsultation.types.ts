export enum DoctorSpecialty {
    GENERAL_PRACTITIONER = 'general_practitioner',
    CARDIOLOGIST = 'cardiologist',
    DERMATOLOGIST = 'dermatologist',
    NEUROLOGIST = 'neurologist',
    PEDIATRICIAN = 'pediatrician',
    PSYCHIATRIST = 'psychiatrist',
}

export interface DoctorPersona {
    id: string;
    name: string;
    specialty: DoctorSpecialty;
    specialtyDisplay: string;
    description: string;
    voiceId?: string; // ElevenLabs voice ID
    systemPrompt: string;
    icon: string; // Lucide icon name
}

export interface ConversationMessage {
    id: string;
    speaker: 'doctor' | 'patient';
    text: string;
    timestamp: Date;
    audioUrl?: string;
}

export interface VoiceConsultation {
    id: string;
    userId: string;
    specialty: DoctorSpecialty;
    doctorName: string;
    startedAt: Date;
    endedAt?: Date;
    transcript: ConversationMessage[];
    status: 'active' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

export interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
}

export interface Prescription {
    id: string;
    consultationId: string;
    userId: string;
    diagnosis: string;
    medications: Medication[];
    instructions: string;
    doctorName: string;
    specialty: string;
    issuedAt: Date;
    createdAt: Date;
}

export interface ConsultationState {
    isActive: boolean;
    isListening: boolean;
    isSpeaking: boolean;
    currentMessage: string;
    error?: string;
}
