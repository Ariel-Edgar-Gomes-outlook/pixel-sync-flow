-- Notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    delivered BOOLEAN DEFAULT false,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Job team members (many-to-many relationship)
CREATE TABLE public.job_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(job_id, user_id)
);

-- Job resources (many-to-many relationship)
CREATE TABLE public.job_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    reserved_from TIMESTAMP WITH TIME ZONE NOT NULL,
    reserved_until TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(job_id, resource_id)
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Authenticated users can insert notifications" ON public.notifications
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = recipient_id);

-- RLS Policies for job_team_members
CREATE POLICY "Authenticated users can view job team members" ON public.job_team_members
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert job team members" ON public.job_team_members
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update job team members" ON public.job_team_members
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Owners and admins can delete job team members" ON public.job_team_members
    FOR DELETE TO authenticated USING (
        public.has_role(auth.uid(), 'owner') OR 
        public.has_role(auth.uid(), 'admin')
    );

-- RLS Policies for job_resources
CREATE POLICY "Authenticated users can view job resources" ON public.job_resources
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert job resources" ON public.job_resources
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update job resources" ON public.job_resources
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Owners and admins can delete job resources" ON public.job_resources
    FOR DELETE TO authenticated USING (
        public.has_role(auth.uid(), 'owner') OR 
        public.has_role(auth.uid(), 'admin')
    );

-- Trigger to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_job_team_members_job ON public.job_team_members(job_id);
CREATE INDEX idx_job_team_members_user ON public.job_team_members(user_id);
CREATE INDEX idx_job_resources_job ON public.job_resources(job_id);
CREATE INDEX idx_job_resources_resource ON public.job_resources(resource_id);

-- Add trigger for updated_at on notifications
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check resource availability (prevent overbooking)
CREATE OR REPLACE FUNCTION public.check_resource_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.job_resources
        WHERE resource_id = NEW.resource_id
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND (
            (NEW.reserved_from, NEW.reserved_until) OVERLAPS (reserved_from, reserved_until)
        )
    ) THEN
        RAISE EXCEPTION 'Resource is already booked for the selected time period';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER check_resource_booking_conflict
    BEFORE INSERT OR UPDATE ON public.job_resources
    FOR EACH ROW
    EXECUTE FUNCTION public.check_resource_availability();