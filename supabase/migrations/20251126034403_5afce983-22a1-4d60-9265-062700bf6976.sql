-- Add custom_currencies field to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS custom_currencies jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN user_preferences.custom_currencies IS 'User-defined custom currencies in format: [{"code": "XXX", "symbol": "X", "name": "Currency Name"}]';
