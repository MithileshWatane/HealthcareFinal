-- Voice Consultations and Prescriptions Schema
-- This migration creates tables for storing voice consultation sessions and generated prescriptions

-- Create voice_consultations table
CREATE TABLE IF NOT EXISTS public.voice_consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    specialty TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES public.voice_consultations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL,
    medications JSONB NOT NULL DEFAULT '[]'::jsonb,
    instructions TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_voice_consultations_user_id ON public.voice_consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_consultations_status ON public.voice_consultations(status);
CREATE INDEX IF NOT EXISTS idx_voice_consultations_created_at ON public.voice_consultations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prescriptions_user_id ON public.prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_consultation_id ON public.prescriptions(consultation_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_issued_at ON public.prescriptions(issued_at DESC);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for voice_consultations updated_at
DROP TRIGGER IF EXISTS update_voice_consultations_updated_at ON public.voice_consultations;
CREATE TRIGGER update_voice_consultations_updated_at
    BEFORE UPDATE ON public.voice_consultations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.voice_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for voice_consultations
-- Users can view their own consultations
CREATE POLICY "Users can view their own consultations"
    ON public.voice_consultations
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own consultations
CREATE POLICY "Users can create their own consultations"
    ON public.voice_consultations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own consultations
CREATE POLICY "Users can update their own consultations"
    ON public.voice_consultations
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own consultations
CREATE POLICY "Users can delete their own consultations"
    ON public.voice_consultations
    FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for prescriptions
-- Users can view their own prescriptions
CREATE POLICY "Users can view their own prescriptions"
    ON public.prescriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own prescriptions
CREATE POLICY "Users can create their own prescriptions"
    ON public.prescriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own prescriptions
CREATE POLICY "Users can update their own prescriptions"
    ON public.prescriptions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own prescriptions
CREATE POLICY "Users can delete their own prescriptions"
    ON public.prescriptions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.voice_consultations TO authenticated;
GRANT ALL ON public.prescriptions TO authenticated;
