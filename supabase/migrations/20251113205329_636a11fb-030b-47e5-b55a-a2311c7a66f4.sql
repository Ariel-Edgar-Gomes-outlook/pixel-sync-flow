-- Add sent_to_client_at column to client_galleries table
ALTER TABLE client_galleries 
ADD COLUMN IF NOT EXISTS sent_to_client_at timestamp with time zone;