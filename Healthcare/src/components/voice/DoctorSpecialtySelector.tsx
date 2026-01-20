import { motion } from 'framer-motion';
import {
    Stethoscope,
    Heart,
    Sparkles,
    Brain,
    Baby,
    HeartHandshake,
    ChevronRight
} from 'lucide-react';
import { DoctorSpecialty } from '@/types/voiceConsultation.types';
import { getAllDoctorPersonas } from '@/services/doctorPersonaService';
import { cn } from '@/lib/utils';

interface DoctorSpecialtySelectorProps {
    onSelectSpecialty: (specialty: DoctorSpecialty) => void;
    selectedSpecialty?: DoctorSpecialty;
}

const iconMap: Record<string, any> = {
    Stethoscope,
    Heart,
    Sparkles,
    Brain,
    Baby,
    HeartHandshake,
};

export function DoctorSpecialtySelector({
    onSelectSpecialty,
    selectedSpecialty,
}: DoctorSpecialtySelectorProps) {
    const personas = getAllDoctorPersonas();

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="font-display font-semibold text-2xl text-foreground mb-2">
                    Choose Your Specialist
                </h2>
                <p className="text-muted-foreground">
                    Select a doctor specialty for your voice consultation
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personas.map((persona, index) => {
                    const Icon = iconMap[persona.icon] || Stethoscope;
                    const isSelected = selectedSpecialty === persona.specialty;

                    return (
                        <motion.button
                            key={persona.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => onSelectSpecialty(persona.specialty)}
                            className={cn(
                                'relative p-6 rounded-2xl border-2 text-left transition-all',
                                'hover:shadow-lg hover:scale-105',
                                isSelected
                                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                                    : 'border-border bg-card hover:border-primary/50'
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={cn(
                                        'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                                        isSelected
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-primary/10 text-primary'
                                    )}
                                >
                                    <Icon className="w-6 h-6" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                                        {persona.specialtyDisplay}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {persona.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {persona.description}
                                    </p>
                                </div>

                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute top-4 right-4"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                            <ChevronRight className="w-4 h-4 text-primary-foreground" />
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
