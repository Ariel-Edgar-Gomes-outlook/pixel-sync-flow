-- Make user_id nullable and remove the foreign key constraint
-- This allows team members (not auth users) to be assigned to jobs

-- Drop the foreign key constraint on user_id
ALTER TABLE public.job_team_members 
DROP CONSTRAINT IF EXISTS job_team_members_user_id_fkey;

-- Make user_id nullable (for backward compatibility)
ALTER TABLE public.job_team_members 
ALTER COLUMN user_id DROP NOT NULL;