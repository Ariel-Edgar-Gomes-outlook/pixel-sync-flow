-- Make user_id nullable and remove the foreign key constraint
-- This allows team members (not auth users) to be assigned to jobs

-- Drop the foreign key constraint on user_id
ALTER TABLE public.job_team_members 
DROP CONSTRAINT IF EXISTS job_team_members_user_id_fkey;

-- Make user_id nullable (for backward compatibility)
ALTER TABLE public.job_team_members 
ALTER COLUMN user_id DROP NOT NULL;

-- Make team_member_id the primary reference
-- (it's already added, just ensuring it works correctly)

-- Add a check to ensure at least one of user_id or team_member_id is set
ALTER TABLE public.job_team_members
ADD CONSTRAINT job_team_members_member_check 
CHECK (user_id IS NOT NULL OR team_member_id IS NOT NULL);