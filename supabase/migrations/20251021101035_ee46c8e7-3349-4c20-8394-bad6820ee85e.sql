-- Add type field to profiles to distinguish team members from clients
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'client';
COMMENT ON COLUMN profiles.type IS 'User type: client, photographer, assistant, editor, admin';

-- Add Google Calendar integration fields to jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT;

-- Create table for calendar integrations
CREATE TABLE IF NOT EXISTS calendar_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'google',
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  calendar_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on calendar_integrations
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Users can only view and manage their own calendar integrations
CREATE POLICY "Users can view their own calendar integrations"
  ON calendar_integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar integrations"
  ON calendar_integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar integrations"
  ON calendar_integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar integrations"
  ON calendar_integrations FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_calendar_integrations_updated_at
  BEFORE UPDATE ON calendar_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();