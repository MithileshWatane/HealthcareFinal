import { supabase } from '@/lib/supabase';
import { Prescription, Medication, ConversationMessage } from '@/types/voiceConsultation.types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jsPDF from 'jspdf';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const isValidKey = apiKey && apiKey !== 'your_gemini_api_key_here';
const genAI = isValidKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Generate prescription data from conversation transcript using AI
 */
export async function generatePrescriptionFromTranscript(
    transcript: ConversationMessage[],
    specialty: string,
    doctorName: string
): Promise<Omit<Prescription, 'id' | 'consultationId' | 'userId' | 'createdAt'> | null> {
    if (!genAI) {
        console.error('Gemini API not configured');
        return null;
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

        // Format the conversation for the AI
        const conversationText = transcript
            .map((msg) => `${msg.speaker === 'doctor' ? 'Doctor' : 'Patient'}: ${msg.text}`)
            .join('\n');

        const prompt = `Based on the following medical consultation, generate a prescription in JSON format.

Conversation:
${conversationText}

Generate a JSON object with the following structure:
{
  "diagnosis": "Primary diagnosis based on the consultation",
  "medications": [
    {
      "name": "Medication name",
      "dosage": "Dosage amount",
      "frequency": "How often to take",
      "duration": "How long to take it",
      "instructions": "Special instructions (optional)"
    }
  ],
  "instructions": "General instructions, lifestyle recommendations, and follow-up advice"
}

Important:
- Only include medications that were discussed or would be appropriate for the condition
- Be specific with dosages and frequencies
- Include relevant warnings and follow-up recommendations
- If no medications are needed, return an empty medications array
- Keep the diagnosis concise but accurate

Return ONLY the JSON object, no additional text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Remove markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');

        const prescriptionData = JSON.parse(text);

        return {
            diagnosis: prescriptionData.diagnosis,
            medications: prescriptionData.medications,
            instructions: prescriptionData.instructions,
            doctorName,
            specialty,
            issuedAt: new Date(),
        };
    } catch (error) {
        console.error('Error generating prescription:', error);
        return null;
    }
}

/**
 * Create and save a prescription to the database
 */
export async function createPrescription(
    consultationId: string,
    userId: string,
    prescriptionData: Omit<Prescription, 'id' | 'consultationId' | 'userId' | 'createdAt'>
): Promise<Prescription | null> {
    try {
        const { data, error } = await supabase
            .from('prescriptions')
            .insert({
                consultation_id: consultationId,
                user_id: userId,
                diagnosis: prescriptionData.diagnosis,
                medications: prescriptionData.medications,
                instructions: prescriptionData.instructions,
                doctor_name: prescriptionData.doctorName,
                specialty: prescriptionData.specialty,
                issued_at: prescriptionData.issuedAt.toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating prescription:', error);
            return null;
        }

        return {
            id: data.id,
            consultationId: data.consultation_id,
            userId: data.user_id,
            diagnosis: data.diagnosis,
            medications: data.medications,
            instructions: data.instructions,
            doctorName: data.doctor_name,
            specialty: data.specialty,
            issuedAt: new Date(data.issued_at),
            createdAt: new Date(data.created_at),
        };
    } catch (error) {
        console.error('Error creating prescription:', error);
        return null;
    }
}

/**
 * Get prescriptions for a user
 */
export async function getUserPrescriptions(userId: string): Promise<Prescription[]> {
    try {
        const { data, error } = await supabase
            .from('prescriptions')
            .select('*')
            .eq('user_id', userId)
            .order('issued_at', { ascending: false });

        if (error) {
            console.error('Error fetching prescriptions:', error);
            return [];
        }

        return data.map((item) => ({
            id: item.id,
            consultationId: item.consultation_id,
            userId: item.user_id,
            diagnosis: item.diagnosis,
            medications: item.medications,
            instructions: item.instructions,
            doctorName: item.doctor_name,
            specialty: item.specialty,
            issuedAt: new Date(item.issued_at),
            createdAt: new Date(item.created_at),
        }));
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        return [];
    }
}

/**
 * Get a specific prescription by ID
 */
export async function getPrescriptionById(prescriptionId: string): Promise<Prescription | null> {
    try {
        const { data, error } = await supabase
            .from('prescriptions')
            .select('*')
            .eq('id', prescriptionId)
            .single();

        if (error) {
            console.error('Error fetching prescription:', error);
            return null;
        }

        return {
            id: data.id,
            consultationId: data.consultation_id,
            userId: data.user_id,
            diagnosis: data.diagnosis,
            medications: data.medications,
            instructions: data.instructions,
            doctorName: data.doctor_name,
            specialty: data.specialty,
            issuedAt: new Date(data.issued_at),
            createdAt: new Date(data.created_at),
        };
    } catch (error) {
        console.error('Error fetching prescription:', error);
        return null;
    }
}

/**
 * Generate a PDF prescription
 */
export function generatePrescriptionPDF(prescription: Prescription, patientName: string): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;

    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Medical Prescription', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Disclaimer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text(
        'This is an AI-generated prescription for educational purposes only.',
        pageWidth / 2,
        yPosition,
        { align: 'center' }
    );
    doc.text(
        'Please consult a licensed healthcare provider for actual medical advice.',
        pageWidth / 2,
        yPosition + 4,
        { align: 'center' }
    );
    yPosition += 15;

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Doctor and Patient Information
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Doctor: ${prescription.doctorName}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Specialty: ${prescription.specialty}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Date: ${prescription.issuedAt.toLocaleDateString()}`, margin, yPosition);
    yPosition += 10;

    doc.text(`Patient: ${patientName}`, margin, yPosition);
    yPosition += 15;

    // Diagnosis
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnosis:', margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const diagnosisLines = doc.splitTextToSize(prescription.diagnosis, pageWidth - 2 * margin);
    doc.text(diagnosisLines, margin, yPosition);
    yPosition += diagnosisLines.length * 6 + 10;

    // Medications
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Medications:', margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    if (prescription.medications.length === 0) {
        doc.text('No medications prescribed.', margin + 5, yPosition);
        yPosition += 10;
    } else {
        prescription.medications.forEach((med: Medication, index: number) => {
            doc.setFont('helvetica', 'bold');
            doc.text(`${index + 1}. ${med.name}`, margin + 5, yPosition);
            yPosition += 6;

            doc.setFont('helvetica', 'normal');
            doc.text(`   Dosage: ${med.dosage}`, margin + 5, yPosition);
            yPosition += 5;
            doc.text(`   Frequency: ${med.frequency}`, margin + 5, yPosition);
            yPosition += 5;
            doc.text(`   Duration: ${med.duration}`, margin + 5, yPosition);
            yPosition += 5;

            if (med.instructions) {
                const instructionLines = doc.splitTextToSize(
                    `   Instructions: ${med.instructions}`,
                    pageWidth - 2 * margin - 10
                );
                doc.text(instructionLines, margin + 5, yPosition);
                yPosition += instructionLines.length * 5;
            }

            yPosition += 5;
        });
    }

    yPosition += 5;

    // General Instructions
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Instructions:', margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const instructionLines = doc.splitTextToSize(prescription.instructions, pageWidth - 2 * margin);
    doc.text(instructionLines, margin, yPosition);
    yPosition += instructionLines.length * 6 + 15;

    // Signature line
    yPosition = Math.max(yPosition, doc.internal.pageSize.getHeight() - 40);
    doc.setFont('helvetica', 'normal');
    doc.text('_________________________', margin, yPosition);
    yPosition += 6;
    doc.text(`${prescription.doctorName}`, margin, yPosition);
    yPosition += 5;
    doc.text(`${prescription.specialty}`, margin, yPosition);

    return doc;
}

/**
 * Download prescription as PDF
 */
export function downloadPrescription(prescription: Prescription, patientName: string): void {
    const doc = generatePrescriptionPDF(prescription, patientName);
    const fileName = `prescription_${prescription.issuedAt.toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
}
