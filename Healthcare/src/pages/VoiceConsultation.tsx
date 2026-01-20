import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { DoctorSpecialtySelector } from '@/components/voice/DoctorSpecialtySelector';
import { VoiceConversationInterface } from '@/components/voice/VoiceConversationInterface';
import { ConversationTranscript } from '@/components/voice/ConversationTranscript';
import { PrescriptionPreview } from '@/components/voice/PrescriptionPreview';
import {
  DoctorSpecialty,
  ConversationMessage,
  ConsultationState,
  Prescription,
} from '@/types/voiceConsultation.types';
import { getDoctorPersona } from '@/services/doctorPersonaService';
import {
  startSpeechRecognition,
  stopSpeechRecognition,
  textToSpeech,
  getVoiceForSpecialty,
  playAudio,
  requestMicrophonePermission,
  isElevenLabsConfigured,
} from '@/services/elevenLabsService';
import {
  createConsultation,
  updateTranscript,
  endConsultation,
} from '@/services/voiceConsultationService';
import {
  generatePrescriptionFromTranscript,
  createPrescription,
  downloadPrescription,
} from '@/services/prescriptionService';
import { generateDoctorResponse } from '@/services/aiConversationService';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type ConsultationStep = 'select-specialty' | 'consultation' | 'prescription';

export default function VoiceConsultation() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<ConsultationStep>('select-specialty');
  const [selectedSpecialty, setSelectedSpecialty] = useState<DoctorSpecialty | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string>('Patient');

  const [state, setState] = useState<ConsultationState>({
    isActive: false,
    isListening: false,
    isSpeaking: false,
    currentMessage: '',
  });

  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isGeneratingPrescription, setIsGeneratingPrescription] = useState(false);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Try to get user's name from metadata or profile
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Patient';
        setPatientName(name);
      }
    };
    getCurrentUser();
  }, []);

  const handleSelectSpecialty = async (specialty: DoctorSpecialty) => {
    setSelectedSpecialty(specialty);

    // Request microphone permission
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      toast({
        title: 'Microphone Access Required',
        description: 'Please allow microphone access to use voice consultation.',
        variant: 'destructive',
      });
      return;
    }

    // Create consultation session
    if (userId) {
      const persona = getDoctorPersona(specialty);
      const consultation = await createConsultation(userId, specialty, persona.name);
      if (consultation) {
        setConsultationId(consultation.id);
        setState((prev) => ({ ...prev, isActive: true }));
        setCurrentStep('consultation');

        // Add welcome message from doctor
        const welcomeMessage: ConversationMessage = {
          id: `msg-${Date.now()}`,
          speaker: 'doctor',
          text: `Hello! I'm ${persona.name}, your ${persona.specialtyDisplay}. How can I help you today?`,
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
        await updateTranscript(consultation.id, welcomeMessage);

        // Speak welcome message if ElevenLabs is configured
        if (isElevenLabsConfigured()) {
          speakDoctorMessage(welcomeMessage.text, specialty);
        }
      }
    }
  };

  const speakDoctorMessage = async (text: string, specialty: DoctorSpecialty) => {
    setState((prev) => ({ ...prev, isSpeaking: true }));
    const voiceId = getVoiceForSpecialty(specialty);
    const audioBlob = await textToSpeech(text, voiceId);

    if (audioBlob) {
      try {
        await playAudio(audioBlob);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }

    setState((prev) => ({ ...prev, isSpeaking: false }));
  };

  const handleStartListening = () => {
    const rec = startSpeechRecognition(
      (transcript) => {
        setState((prev) => ({ ...prev, currentMessage: transcript }));
      },
      (error) => {
        setState((prev) => ({ ...prev, error, isListening: false }));
        toast({
          title: 'Speech Recognition Error',
          description: error,
          variant: 'destructive',
        });
      }
    );

    if (rec) {
      setRecognition(rec);
      setState((prev) => ({ ...prev, isListening: true, currentMessage: '', error: undefined }));
    }
  };

  const handleStopListening = async () => {
    if (recognition) {
      stopSpeechRecognition(recognition);
      setRecognition(null);
    }

    const userMessage = state.currentMessage.trim();
    if (!userMessage) {
      setState((prev) => ({ ...prev, isListening: false, currentMessage: '' }));
      return;
    }

    setState((prev) => ({ ...prev, isListening: false }));

    // Add user message to transcript
    const userMsg: ConversationMessage = {
      id: `msg-${Date.now()}`,
      speaker: 'patient',
      text: userMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (consultationId) {
      await updateTranscript(consultationId, userMsg);
    }

    // Generate doctor response
    if (selectedSpecialty) {
      setState((prev) => ({ ...prev, isSpeaking: true }));

      const doctorResponseText = await generateDoctorResponse(
        selectedSpecialty,
        messages,
        userMessage
      );

      const doctorMsg: ConversationMessage = {
        id: `msg-${Date.now() + 1}`,
        speaker: 'doctor',
        text: doctorResponseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, doctorMsg]);
      if (consultationId) {
        await updateTranscript(consultationId, doctorMsg);
      }

      // Speak the response if ElevenLabs is configured
      if (isElevenLabsConfigured()) {
        await speakDoctorMessage(doctorResponseText, selectedSpecialty);
      } else {
        setState((prev) => ({ ...prev, isSpeaking: false }));
      }
    }

    setState((prev) => ({ ...prev, currentMessage: '' }));
  };

  const handleEndConsultation = async () => {
    if (consultationId) {
      await endConsultation(consultationId);
    }

    setState((prev) => ({ ...prev, isActive: false }));

    // Generate prescription
    if (selectedSpecialty && messages.length > 1 && userId && consultationId) {
      setIsGeneratingPrescription(true);

      const persona = getDoctorPersona(selectedSpecialty);
      const prescriptionData = await generatePrescriptionFromTranscript(
        messages,
        persona.specialtyDisplay,
        persona.name
      );

      if (prescriptionData) {
        const savedPrescription = await createPrescription(
          consultationId,
          userId,
          prescriptionData
        );

        if (savedPrescription) {
          setPrescription(savedPrescription);
          setCurrentStep('prescription');
          toast({
            title: 'Prescription Generated',
            description: 'Your prescription has been generated successfully.',
          });
        }
      }

      setIsGeneratingPrescription(false);
    }
  };

  const handleDownloadPrescription = () => {
    if (prescription) {
      downloadPrescription(prescription, patientName);
      toast({
        title: 'Prescription Downloaded',
        description: 'Your prescription PDF has been downloaded.',
      });
    }
  };

  const handleStartNew = () => {
    setCurrentStep('select-specialty');
    setSelectedSpecialty(null);
    setConsultationId(null);
    setMessages([]);
    setPrescription(null);
    setState({
      isActive: false,
      isListening: false,
      isSpeaking: false,
      currentMessage: '',
    });
  };

  const doctorPersona = selectedSpecialty ? getDoctorPersona(selectedSpecialty) : null;

  return (
    <Layout>
      <PageHeader
        icon={Mic}
        title="Voice Consultation"
        description="Consult with AI-powered specialist doctors using voice interaction"
      />

      <AnimatePresence mode="wait">
        {/* Step 1: Select Specialty */}
        {currentStep === 'select-specialty' && (
          <motion.div
            key="select-specialty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <DoctorSpecialtySelector
              onSelectSpecialty={handleSelectSpecialty}
              selectedSpecialty={selectedSpecialty || undefined}
            />
          </motion.div>
        )}

        {/* Step 2: Consultation */}
        {currentStep === 'consultation' && doctorPersona && (
          <motion.div
            key="consultation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Header with doctor info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleStartNew}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h2 className="font-display font-semibold text-xl text-foreground">
                    {doctorPersona.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {doctorPersona.specialtyDisplay}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleEndConsultation}
                disabled={isGeneratingPrescription || messages.length <= 1}
                className="gradient-primary text-primary-foreground"
              >
                {isGeneratingPrescription ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Generating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    End & Get Prescription
                  </>
                )}
              </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Voice Interface */}
              <div className="bg-card rounded-2xl shadow-card border border-border p-6">
                <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                  Voice Consultation
                </h3>
                <VoiceConversationInterface
                  state={state}
                  onStartListening={handleStartListening}
                  onStopListening={handleStopListening}
                  doctorName={doctorPersona.name}
                />
              </div>

              {/* Transcript */}
              <div className="bg-card rounded-2xl shadow-card border border-border p-6">
                <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                  Conversation Transcript
                </h3>
                <div className="h-[400px]">
                  <ConversationTranscript
                    messages={messages}
                    doctorName={doctorPersona.name}
                  />
                </div>
              </div>
            </div>

            {/* ElevenLabs Warning */}
            {!isElevenLabsConfigured() && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4"
              >
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-700 dark:text-yellow-400">
                      Text-to-Speech Not Available
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">
                      ElevenLabs API key is not configured. The doctor's responses will appear
                      as text only. Add your API key to .env to enable voice responses.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 3: Prescription */}
        {currentStep === 'prescription' && prescription && (
          <motion.div
            key="prescription"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-2xl text-foreground">
                Consultation Complete
              </h2>
              <Button onClick={handleStartNew} variant="outline">
                Start New Consultation
              </Button>
            </div>

            <PrescriptionPreview
              prescription={prescription}
              onDownload={handleDownloadPrescription}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
