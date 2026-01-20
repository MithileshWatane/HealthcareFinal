-- ============================================================================
-- COMPLETE VOICE BOOKING SYSTEM MIGRATION
-- ============================================================================
-- This migration creates all necessary tables and functions for the 
-- voice-based appointment booking system with n8n and ElevenLabs/VAPI
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: APPOINTMENTS
-- ============================================================================
-- Main appointments table for all bookings (web and voice)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id TEXT NOT NULL,
  doctor_name TEXT,
  specialty TEXT,
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  patient_email TEXT,
  appointment_date TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  notes TEXT,
  booking_source TEXT DEFAULT 'web',
  voice_session_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for appointments table
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_name);
CREATE INDEX IF NOT EXISTS idx_appointments_source ON appointments(booking_source);

-- ============================================================================
-- TABLE 2: VOICE BOOKING SESSIONS
-- ============================================================================
-- Tracks individual voice conversation sessions
CREATE TABLE IF NOT EXISTS voice_booking_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  phone_number TEXT,
  email TEXT,
  patient_name TEXT,
  status TEXT CHECK (status IN ('in_progress', 'completed', 'failed', 'cancelled')) DEFAULT 'in_progress',
  conversation_transcript JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for voice_booking_sessions
CREATE INDEX IF NOT EXISTS idx_voice_sessions_session_id ON voice_booking_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_user ON voice_booking_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_status ON voice_booking_sessions(status);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_created ON voice_booking_sessions(created_at DESC);

-- ============================================================================
-- TABLE 3: VOICE BOOKING ATTEMPTS
-- ============================================================================
-- Tracks each booking attempt within a voice session
CREATE TABLE IF NOT EXISTS voice_booking_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES voice_booking_sessions(id) ON DELETE CASCADE,
  doctor_id TEXT,
  doctor_name TEXT,
  specialty TEXT,
  requested_date DATE,
  requested_time TIME,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'rejected', 'alternative_offered')) DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for voice_booking_attempts
CREATE INDEX IF NOT EXISTS idx_voice_attempts_session ON voice_booking_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_attempts_appointment ON voice_booking_attempts(appointment_id);
CREATE INDEX IF NOT EXISTS idx_voice_attempts_status ON voice_booking_attempts(status);
CREATE INDEX IF NOT EXISTS idx_voice_attempts_doctor ON voice_booking_attempts(doctor_id);

-- Add foreign key from appointments to voice_booking_sessions
ALTER TABLE appointments 
  ADD CONSTRAINT fk_appointments_voice_session 
  FOREIGN KEY (voice_session_id) 
  REFERENCES voice_booking_sessions(id) 
  ON DELETE SET NULL;

-- ============================================================================
-- TRIGGER FUNCTION: AUTO-UPDATE TIMESTAMPS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for appointments table
DROP TRIGGER IF EXISTS appointments_updated_at_trigger ON appointments;
CREATE TRIGGER appointments_updated_at_trigger
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for voice_booking_sessions table
DROP TRIGGER IF EXISTS voice_sessions_updated_at_trigger ON voice_booking_sessions;
CREATE TRIGGER voice_sessions_updated_at_trigger
  BEFORE UPDATE ON voice_booking_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RPC FUNCTION 1: CHECK DOCTOR AVAILABILITY
-- ============================================================================
-- Checks if a doctor is available at a specific date and time
-- Used by n8n workflow and ElevenLabs/VAPI
CREATE OR REPLACE FUNCTION check_doctor_availability(
  p_doctor_id TEXT,
  p_date DATE,
  p_time TIME
)
RETURNS JSONB AS $$
DECLARE
  v_datetime TIMESTAMPTZ;
  v_existing_count INTEGER;
  v_result JSONB;
BEGIN
  -- Combine date and time into timestamp
  v_datetime := (p_date || ' ' || p_time)::TIMESTAMPTZ;
  
  -- Count existing appointments at this time
  SELECT COUNT(*) INTO v_existing_count
  FROM appointments
  WHERE doctor_id = p_doctor_id
    AND appointment_date::DATE = p_date
    AND appointment_date::TIME = p_time
    AND status IN ('confirmed', 'pending');
  
  -- Build result JSON
  v_result := jsonb_build_object(
    'available', v_existing_count = 0,
    'doctor_id', p_doctor_id,
    'date', p_date,
    'time', p_time,
    'existing_appointments', v_existing_count,
    'datetime', v_datetime
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RPC FUNCTION 2: CREATE VOICE BOOKING
-- ============================================================================
-- Creates a complete voice booking with session, attempt, and appointment
-- Used by n8n workflow when ElevenLabs/VAPI confirms booking
CREATE OR REPLACE FUNCTION create_voice_booking(
  p_session_id TEXT,
  p_doctor_id TEXT,
  p_doctor_name TEXT,
  p_specialty TEXT,
  p_date DATE,
  p_time TIME,
  p_patient_name TEXT,
  p_patient_phone TEXT DEFAULT NULL,
  p_patient_email TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_session_uuid UUID;
  v_attempt_id UUID;
  v_appointment_id UUID;
  v_datetime TIMESTAMPTZ;
  v_result JSONB;
BEGIN
  -- Combine date and time
  v_datetime := (p_date || ' ' || p_time)::TIMESTAMPTZ;
  
  -- Get or create voice booking session
  INSERT INTO voice_booking_sessions (
    session_id, 
    phone_number, 
    email, 
    patient_name,
    status
  )
  VALUES (
    p_session_id, 
    p_patient_phone, 
    p_patient_email, 
    p_patient_name,
    'in_progress'
  )
  ON CONFLICT (session_id) 
  DO UPDATE SET 
    phone_number = EXCLUDED.phone_number,
    email = EXCLUDED.email,
    patient_name = EXCLUDED.patient_name,
    updated_at = NOW()
  RETURNING id INTO v_session_uuid;
  
  -- Create appointment
  INSERT INTO appointments (
    doctor_id, 
    doctor_name,
    specialty,
    patient_name, 
    patient_phone, 
    patient_email,
    appointment_date, 
    status, 
    booking_source, 
    voice_session_id
  )
  VALUES (
    p_doctor_id,
    p_doctor_name,
    p_specialty,
    p_patient_name, 
    p_patient_phone, 
    p_patient_email,
    v_datetime, 
    'confirmed', 
    'voice', 
    v_session_uuid
  )
  RETURNING id INTO v_appointment_id;
  
  -- Create booking attempt record
  INSERT INTO voice_booking_attempts (
    session_id, 
    doctor_id, 
    doctor_name, 
    specialty,
    requested_date, 
    requested_time, 
    appointment_id,
    status
  )
  VALUES (
    v_session_uuid, 
    p_doctor_id, 
    p_doctor_name, 
    p_specialty,
    p_date, 
    p_time, 
    v_appointment_id,
    'confirmed'
  )
  RETURNING id INTO v_attempt_id;
  
  -- Update session status to completed
  UPDATE voice_booking_sessions
  SET status = 'completed'
  WHERE id = v_session_uuid;
  
  -- Build success result
  v_result := jsonb_build_object(
    'success', true,
    'session_id', v_session_uuid,
    'attempt_id', v_attempt_id,
    'appointment_id', v_appointment_id,
    'appointment_date', v_datetime,
    'message', 'Appointment booked successfully'
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    v_result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to create booking'
    );
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RPC FUNCTION 3: GET VOICE BOOKING HISTORY
-- ============================================================================
-- Retrieves voice booking history for a user or session
CREATE OR REPLACE FUNCTION get_voice_booking_history(
  p_session_id TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'session_id', vbs.session_id,
      'patient_name', vbs.patient_name,
      'status', vbs.status,
      'created_at', vbs.created_at,
      'appointments', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'doctor_name', a.doctor_name,
            'specialty', a.specialty,
            'appointment_date', a.appointment_date,
            'status', a.status
          )
        )
        FROM appointments a
        WHERE a.voice_session_id = vbs.id
      )
    )
  ) INTO v_result
  FROM voice_booking_sessions vbs
  WHERE (p_session_id IS NULL OR vbs.session_id = p_session_id)
    AND (p_user_id IS NULL OR vbs.user_id = p_user_id)
  ORDER BY vbs.created_at DESC
  LIMIT p_limit;
  
  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PERMISSIONS
-- ============================================================================
-- Grant necessary permissions for anon and authenticated users
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON appointments TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON voice_booking_sessions TO anon, authenticated;
GRANT SELECT, INSERT ON voice_booking_attempts TO anon, authenticated;

-- Grant execute permissions on RPC functions
GRANT EXECUTE ON FUNCTION check_doctor_availability(TEXT, DATE, TIME) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_voice_booking(TEXT, TEXT, TEXT, TEXT, DATE, TIME, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_voice_booking_history(TEXT, UUID, INTEGER) TO anon, authenticated;

-- ============================================================================
-- SAMPLE DATA (OPTIONAL - COMMENT OUT IF NOT NEEDED)
-- ============================================================================
-- Insert sample doctors for testing
-- UNCOMMENT BELOW TO ADD SAMPLE DATA

/*
INSERT INTO appointments (doctor_id, doctor_name, specialty, patient_name, appointment_date, status, booking_source)
VALUES 
  ('1', 'Dr. Sarah Chen', 'General Physician', 'Test Patient 1', '2026-01-25 10:00:00+00', 'confirmed', 'web'),
  ('2', 'Dr. Michael Roberts', 'Cardiologist', 'Test Patient 2', '2026-01-25 14:00:00+00', 'confirmed', 'web'),
  ('3', 'Dr. Emily Watson', 'Dermatologist', 'Test Patient 3', '2026-01-26 09:00:00+00', 'pending', 'web')
ON CONFLICT DO NOTHING;
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Tables created:
--   1. appointments
--   2. voice_booking_sessions
--   3. voice_booking_attempts
--
-- Functions created:
--   1. check_doctor_availability()
--   2. create_voice_booking()
--   3. get_voice_booking_history()
--
-- Ready for voice booking with n8n + ElevenLabs/VAPI!
-- ============================================================================
