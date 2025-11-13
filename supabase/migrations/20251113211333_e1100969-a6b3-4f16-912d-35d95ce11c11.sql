-- Add archived field to team_members table
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false;

-- Add index for better performance when filtering archived members
CREATE INDEX IF NOT EXISTS idx_team_members_archived ON team_members(archived);
