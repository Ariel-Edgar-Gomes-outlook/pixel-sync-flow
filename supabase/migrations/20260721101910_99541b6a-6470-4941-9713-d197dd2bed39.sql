-- Remove plaintext OAuth token storage from calendar_integrations.
-- Feature is not currently used in app; when re-introduced, tokens must be
-- stored encrypted (via Supabase Vault / pgsodium) or held only in edge function memory.
ALTER TABLE public.calendar_integrations
  DROP COLUMN IF EXISTS access_token,
  DROP COLUMN IF EXISTS refresh_token,
  DROP COLUMN IF EXISTS token_expires_at;
