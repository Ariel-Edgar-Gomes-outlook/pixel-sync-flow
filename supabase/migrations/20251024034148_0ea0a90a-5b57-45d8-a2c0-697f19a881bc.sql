-- Create a dedicated table for team members (not linked to auth)
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  type TEXT NOT NULL, -- photographer, assistant, editor, producer, etc.
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for team_members
CREATE POLICY "Authenticated users can view team members"
ON public.team_members
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert team members"
ON public.team_members
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update team members"
ON public.team_members
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Owners and admins can delete team members"
ON public.team_members
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Update job_team_members to reference the new team_members table
-- First, add a new column for team_member_id
ALTER TABLE public.job_team_members ADD COLUMN team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE;

-- Create trigger for updated_at
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_team_members_type ON public.team_members(type);
CREATE INDEX idx_job_team_members_team_member_id ON public.job_team_members(team_member_id);