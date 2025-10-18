-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'photographer', 'editor', 'assistant');

-- Create enum for job status
CREATE TYPE public.job_status AS ENUM ('scheduled', 'confirmed', 'in_production', 'delivery_pending', 'completed', 'cancelled');

-- Create enum for payment status
CREATE TYPE public.payment_status AS ENUM ('pending', 'partial', 'paid', 'refunded');

-- Create enum for lead status
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'proposal_sent', 'won', 'lost');

-- Create enum for quote status
CREATE TYPE public.quote_status AS ENUM ('draft', 'sent', 'accepted', 'rejected');

-- Create enum for contract status
CREATE TYPE public.contract_status AS ENUM ('draft', 'sent', 'signed', 'cancelled');

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- User roles table (SECURITY: separate from profiles)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    UNIQUE(user_id, role)
);

-- Clients table
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    type TEXT DEFAULT 'person',
    notes TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    external_folder_link TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Leads table
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    source TEXT,
    status public.lead_status DEFAULT 'new' NOT NULL,
    probability INTEGER DEFAULT 50,
    notes TEXT,
    responsible_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Jobs table
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    description TEXT,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE,
    location TEXT,
    location_map_embed TEXT,
    status public.job_status DEFAULT 'scheduled' NOT NULL,
    external_assets_links JSONB DEFAULT '[]'::jsonb,
    external_gallery_link TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    estimated_hours DECIMAL(10,2),
    time_spent DECIMAL(10,2),
    estimated_cost DECIMAL(10,2),
    estimated_revenue DECIMAL(10,2),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Quotes table
CREATE TABLE public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL NOT NULL,
    items JSONB DEFAULT '[]'::jsonb NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    validity_date DATE,
    status public.quote_status DEFAULT 'draft' NOT NULL,
    pdf_link TEXT,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Contracts table
CREATE TABLE public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL NOT NULL,
    terms_text TEXT,
    attachments_links JSONB DEFAULT '[]'::jsonb,
    status public.contract_status DEFAULT 'draft' NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    signed_at TIMESTAMP WITH TIME ZONE,
    cancellation_fee DECIMAL(10,2),
    clauses JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Payments table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL NOT NULL,
    type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    method TEXT,
    receipt_link TEXT,
    status public.payment_status DEFAULT 'pending' NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Checklists table
CREATE TABLE public.checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    items JSONB DEFAULT '[]'::jsonb NOT NULL,
    estimated_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Resources table (equipment, vehicles, studios)
CREATE TABLE public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'available',
    location TEXT,
    manual_link TEXT,
    next_maintenance_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Audit logs table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    previous_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create function to check user roles (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checklists_updated_at BEFORE UPDATE ON public.checklists
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Owners can manage all roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- RLS Policies for clients (authenticated users can manage)
CREATE POLICY "Authenticated users can view clients" ON public.clients
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert clients" ON public.clients
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients" ON public.clients
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Owners and admins can delete clients" ON public.clients
    FOR DELETE TO authenticated USING (
        public.has_role(auth.uid(), 'owner') OR 
        public.has_role(auth.uid(), 'admin')
    );

-- RLS Policies for leads
CREATE POLICY "Authenticated users can view leads" ON public.leads
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert leads" ON public.leads
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update leads" ON public.leads
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Owners and admins can delete leads" ON public.leads
    FOR DELETE TO authenticated USING (
        public.has_role(auth.uid(), 'owner') OR 
        public.has_role(auth.uid(), 'admin')
    );

-- RLS Policies for jobs
CREATE POLICY "Authenticated users can view jobs" ON public.jobs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert jobs" ON public.jobs
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update jobs" ON public.jobs
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Owners and admins can delete jobs" ON public.jobs
    FOR DELETE TO authenticated USING (
        public.has_role(auth.uid(), 'owner') OR 
        public.has_role(auth.uid(), 'admin')
    );

-- RLS Policies for quotes
CREATE POLICY "Authenticated users can view quotes" ON public.quotes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert quotes" ON public.quotes
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update quotes" ON public.quotes
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Owners and admins can delete quotes" ON public.quotes
    FOR DELETE TO authenticated USING (
        public.has_role(auth.uid(), 'owner') OR 
        public.has_role(auth.uid(), 'admin')
    );

-- RLS Policies for contracts
CREATE POLICY "Authenticated users can view contracts" ON public.contracts
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert contracts" ON public.contracts
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update contracts" ON public.contracts
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Owners and admins can delete contracts" ON public.contracts
    FOR DELETE TO authenticated USING (
        public.has_role(auth.uid(), 'owner') OR 
        public.has_role(auth.uid(), 'admin')
    );

-- RLS Policies for payments
CREATE POLICY "Authenticated users can view payments" ON public.payments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert payments" ON public.payments
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update payments" ON public.payments
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Owners and admins can delete payments" ON public.payments
    FOR DELETE TO authenticated USING (
        public.has_role(auth.uid(), 'owner') OR 
        public.has_role(auth.uid(), 'admin')
    );

-- RLS Policies for checklists
CREATE POLICY "Authenticated users can view checklists" ON public.checklists
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert checklists" ON public.checklists
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update checklists" ON public.checklists
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Owners and admins can delete checklists" ON public.checklists
    FOR DELETE TO authenticated USING (
        public.has_role(auth.uid(), 'owner') OR 
        public.has_role(auth.uid(), 'admin')
    );

-- RLS Policies for resources
CREATE POLICY "Authenticated users can view resources" ON public.resources
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert resources" ON public.resources
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update resources" ON public.resources
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Owners and admins can delete resources" ON public.resources
    FOR DELETE TO authenticated USING (
        public.has_role(auth.uid(), 'owner') OR 
        public.has_role(auth.uid(), 'admin')
    );

-- RLS Policies for audit_logs (read-only for authenticated users)
CREATE POLICY "Authenticated users can view audit logs" ON public.audit_logs
    FOR SELECT TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_clients_tags ON public.clients USING GIN(tags);
CREATE INDEX idx_jobs_client_id ON public.jobs(client_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_start_datetime ON public.jobs(start_datetime);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_quotes_client_id ON public.quotes(client_id);
CREATE INDEX idx_payments_client_id ON public.payments(client_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);