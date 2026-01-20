-- Chatbot History Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. CHAT SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_created 
ON chat_sessions(user_id, created_at DESC);

-- ============================================
-- 2. CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_session 
ON chat_messages(session_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user 
ON chat_messages(user_id, created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat Sessions Policies
CREATE POLICY "Users can view their own chat sessions"
ON chat_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions"
ON chat_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
ON chat_sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions"
ON chat_sessions FOR DELETE
USING (auth.uid() = user_id);

-- Chat Messages Policies
CREATE POLICY "Users can view their own chat messages"
ON chat_messages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages"
ON chat_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat messages"
ON chat_messages FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages"
ON chat_messages FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_chat_sessions_updated_at
BEFORE UPDATE ON chat_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS FOR CHAT MANAGEMENT
-- ============================================

-- Function to get recent chat sessions with message count
CREATE OR REPLACE FUNCTION get_user_chat_sessions(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  title TEXT,
  message_count BIGINT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    cs.title,
    COUNT(cm.id) as message_count,
    MAX(cm.created_at) as last_message_at,
    cs.created_at
  FROM chat_sessions cs
  LEFT JOIN chat_messages cm ON cs.id = cm.session_id
  WHERE cs.user_id = p_user_id
  GROUP BY cs.id, cs.title, cs.created_at
  ORDER BY COALESCE(MAX(cm.created_at), cs.created_at) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-generate session title from first user message
CREATE OR REPLACE FUNCTION auto_generate_session_title()
RETURNS TRIGGER AS $$
DECLARE
  first_message TEXT;
  session_title TEXT;
BEGIN
  -- Only proceed if this is a user message and session has no title
  IF NEW.role = 'user' THEN
    SELECT title INTO session_title
    FROM chat_sessions
    WHERE id = NEW.session_id;
    
    IF session_title IS NULL THEN
      -- Get first 50 characters of the message as title
      session_title := SUBSTRING(NEW.content FROM 1 FOR 50);
      IF LENGTH(NEW.content) > 50 THEN
        session_title := session_title || '...';
      END IF;
      
      -- Update the session title
      UPDATE chat_sessions
      SET title = session_title
      WHERE id = NEW.session_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_title_chat_session
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION auto_generate_session_title();
