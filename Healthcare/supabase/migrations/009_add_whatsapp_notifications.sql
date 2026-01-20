-- Add WhatsApp notification columns to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_notification_at TIMESTAMPTZ;

-- Create index for efficient querying of tasks that need notifications
CREATE INDEX IF NOT EXISTS idx_tasks_notification_lookup 
ON tasks(whatsapp_enabled, notification_sent, time, time_period, status)
WHERE whatsapp_enabled = TRUE AND notification_sent = FALSE;

-- Add comment for documentation
COMMENT ON COLUMN tasks.phone_number IS 'WhatsApp-enabled phone number in E.164 format (e.g., +1234567890)';
COMMENT ON COLUMN tasks.whatsapp_enabled IS 'Whether WhatsApp notifications are enabled for this task';
COMMENT ON COLUMN tasks.notification_sent IS 'Flag to track if notification has been sent to prevent duplicates';
COMMENT ON COLUMN tasks.last_notification_at IS 'Timestamp of when the last notification was sent';
