import { Prescription } from '@/types/voiceConsultation.types';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface PrescriptionPreviewProps {
    prescription: Prescription;
    onDownload: () => void;
}

export function PrescriptionPreview({
    prescription,
    onDownload,
}: PrescriptionPreviewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/20 p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Generated Prescription
                </h3>
                <Button
                    onClick={onDownload}
                    className="gradient-primary text-primary-foreground"
                    size="sm"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                </Button>
            </div>

            <div className="space-y-4">
                {/* Diagnosis */}
                <div className="bg-card rounded-xl p-4">
                    <p className="font-medium text-foreground mb-2">Diagnosis</p>
                    <p className="text-sm text-muted-foreground">{prescription.diagnosis}</p>
                </div>

                {/* Medications */}
                <div className="bg-card rounded-xl p-4">
                    <p className="font-medium text-foreground mb-3">Medications</p>
                    {prescription.medications.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No medications prescribed.</p>
                    ) : (
                        <ul className="space-y-3">
                            {prescription.medications.map((med, index) => (
                                <li key={index} className="text-sm">
                                    <p className="font-medium text-foreground">{med.name}</p>
                                    <p className="text-muted-foreground">
                                        {med.dosage} - {med.frequency}
                                    </p>
                                    <p className="text-muted-foreground">Duration: {med.duration}</p>
                                    {med.instructions && (
                                        <p className="text-muted-foreground italic mt-1">
                                            {med.instructions}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Instructions */}
                <div className="bg-card rounded-xl p-4">
                    <p className="font-medium text-foreground mb-2">Instructions</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {prescription.instructions}
                    </p>
                </div>

                {/* Doctor Info */}
                <div className="bg-card rounded-xl p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-medium text-foreground">{prescription.doctorName}</p>
                            <p className="text-sm text-muted-foreground">{prescription.specialty}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                                {prescription.issuedAt.toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Medical Disclaimer */}
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    <strong>Disclaimer:</strong> This is an AI-generated prescription for educational
                    purposes only. Please consult a licensed healthcare provider for actual medical
                    advice and treatment.
                </p>
            </div>
        </motion.div>
    );
}
