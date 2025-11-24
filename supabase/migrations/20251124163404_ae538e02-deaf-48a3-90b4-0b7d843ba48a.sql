-- Create table for improvement suggestions
CREATE TABLE IF NOT EXISTS public.improvement_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  system_area VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.improvement_suggestions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own suggestions
CREATE POLICY "Users can create their own suggestions"
  ON public.improvement_suggestions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own suggestions
CREATE POLICY "Users can view their own suggestions"
  ON public.improvement_suggestions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own suggestions
CREATE POLICY "Users can update their own suggestions"
  ON public.improvement_suggestions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_improvement_suggestions_user_id ON public.improvement_suggestions(user_id);
CREATE INDEX idx_improvement_suggestions_status ON public.improvement_suggestions(status);
CREATE INDEX idx_improvement_suggestions_created_at ON public.improvement_suggestions(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_improvement_suggestions_updated_at
  BEFORE UPDATE ON public.improvement_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();