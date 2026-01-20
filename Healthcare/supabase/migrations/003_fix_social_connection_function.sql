-- Fix for "column reference connection_quality is ambiguous" error
-- Renamed local variable to v_connection_quality
CREATE OR REPLACE FUNCTION calculate_social_connection_index(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS DECIMAL AS $$
DECLARE
  interaction_rate DECIMAL;
  v_connection_quality DECIMAL;
  social_index DECIMAL;
BEGIN
  SELECT 
    (COUNT(CASE WHEN talked_to_someone THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
    AVG(connection_quality) * 20
  INTO interaction_rate, v_connection_quality
  FROM social_interaction_entries
  WHERE user_id = p_user_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
  
  social_index := LEAST(100, GREATEST(0,
    (COALESCE(interaction_rate, 0) * 0.4) +
    (COALESCE(v_connection_quality, 0) * 0.6)
  ));
  
  RETURN social_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
