-- Drop the existing restrictive DELETE policy
DROP POLICY IF EXISTS "Owners and admins can delete team members" ON team_members;

-- Create new policy that allows users to delete their own team members
CREATE POLICY "Users can delete own team members"
ON team_members
FOR DELETE
USING (created_by = auth.uid());