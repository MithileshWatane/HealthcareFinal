import { supabase } from '@/lib/supabase';
import { VoiceConsultation, ConversationMessage } from '@/types/voiceConsultation.types';

/**
 * Create a new voice consultation session
 */
export async function createConsultation(
    userId: string,
    specialty: string,
    doctorName: string
): Promise<VoiceConsultation | null> {
    try {
        const { data, error } = await supabase
            .from('voice_consultations')
            .insert({
                user_id: userId,
                specialty,
                doctor_name: doctorName,
                status: 'active',
                transcript: [],
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating consultation:', error);
            return null;
        }

        return {
            id: data.id,
            userId: data.user_id,
            specialty: data.specialty,
            doctorName: data.doctor_name,
            startedAt: new Date(data.started_at),
            endedAt: data.ended_at ? new Date(data.ended_at) : undefined,
            transcript: data.transcript || [],
            status: data.status,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    } catch (error) {
        console.error('Error creating consultation:', error);
        return null;
    }
}

/**
 * Update consultation transcript with a new message
 */
export async function updateTranscript(
    consultationId: string,
    message: ConversationMessage
): Promise<boolean> {
    try {
        // First, get the current consultation
        const { data: consultation, error: fetchError } = await supabase
            .from('voice_consultations')
            .select('transcript')
            .eq('id', consultationId)
            .single();

        if (fetchError) {
            console.error('Error fetching consultation:', fetchError);
            return false;
        }

        const currentTranscript = consultation.transcript || [];
        const updatedTranscript = [...currentTranscript, message];

        // Update with new transcript
        const { error: updateError } = await supabase
            .from('voice_consultations')
            .update({ transcript: updatedTranscript })
            .eq('id', consultationId);

        if (updateError) {
            console.error('Error updating transcript:', updateError);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error updating transcript:', error);
        return false;
    }
}

/**
 * End a consultation session
 */
export async function endConsultation(consultationId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('voice_consultations')
            .update({
                status: 'completed',
                ended_at: new Date().toISOString(),
            })
            .eq('id', consultationId);

        if (error) {
            console.error('Error ending consultation:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error ending consultation:', error);
        return false;
    }
}

/**
 * Get consultation history for a user
 */
export async function getConsultationHistory(
    userId: string
): Promise<VoiceConsultation[]> {
    try {
        const { data, error } = await supabase
            .from('voice_consultations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching consultation history:', error);
            return [];
        }

        return data.map((item) => ({
            id: item.id,
            userId: item.user_id,
            specialty: item.specialty,
            doctorName: item.doctor_name,
            startedAt: new Date(item.started_at),
            endedAt: item.ended_at ? new Date(item.ended_at) : undefined,
            transcript: item.transcript || [],
            status: item.status,
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
        }));
    } catch (error) {
        console.error('Error fetching consultation history:', error);
        return [];
    }
}

/**
 * Get a specific consultation by ID
 */
export async function getConsultationById(
    consultationId: string
): Promise<VoiceConsultation | null> {
    try {
        const { data, error } = await supabase
            .from('voice_consultations')
            .select('*')
            .eq('id', consultationId)
            .single();

        if (error) {
            console.error('Error fetching consultation:', error);
            return null;
        }

        return {
            id: data.id,
            userId: data.user_id,
            specialty: data.specialty,
            doctorName: data.doctor_name,
            startedAt: new Date(data.started_at),
            endedAt: data.ended_at ? new Date(data.ended_at) : undefined,
            transcript: data.transcript || [],
            status: data.status,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    } catch (error) {
        console.error('Error fetching consultation:', error);
        return null;
    }
}

/**
 * Delete a consultation
 */
export async function deleteConsultation(consultationId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('voice_consultations')
            .delete()
            .eq('id', consultationId);

        if (error) {
            console.error('Error deleting consultation:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting consultation:', error);
        return false;
    }
}
