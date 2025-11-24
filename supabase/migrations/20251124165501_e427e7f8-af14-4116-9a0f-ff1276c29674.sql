-- Add admin SELECT policies to allow admins to view all user data

-- Clients: Allow admins to view all clients
CREATE POLICY "Admins can view all clients"
ON public.clients
FOR SELECT
USING (is_admin(auth.uid()));

-- Jobs: Allow admins to view all jobs
CREATE POLICY "Admins can view all jobs"
ON public.jobs
FOR SELECT
USING (is_admin(auth.uid()));

-- Leads: Allow admins to view all leads
CREATE POLICY "Admins can view all leads"
ON public.leads
FOR SELECT
USING (is_admin(auth.uid()));

-- Quotes: Allow admins to view all quotes
CREATE POLICY "Admins can view all quotes"
ON public.quotes
FOR SELECT
USING (is_admin(auth.uid()));

-- Invoices: Allow admins to view all invoices
CREATE POLICY "Admins can view all invoices"
ON public.invoices
FOR SELECT
USING (is_admin(auth.uid()));

-- Contracts: Allow admins to view all contracts
CREATE POLICY "Admins can view all contracts"
ON public.contracts
FOR SELECT
USING (is_admin(auth.uid()));

-- Payments: Allow admins to view all payments
CREATE POLICY "Admins can view all payments"
ON public.payments
FOR SELECT
USING (is_admin(auth.uid()));

-- Resources: Allow admins to view all resources
CREATE POLICY "Admins can view all resources"
ON public.resources
FOR SELECT
USING (is_admin(auth.uid()));

-- Team Members: Allow admins to view all team members
CREATE POLICY "Admins can view all team members"
ON public.team_members
FOR SELECT
USING (is_admin(auth.uid()));

-- Checklist Templates: Allow admins to view all checklist templates
CREATE POLICY "Admins can view all checklist templates"
ON public.checklist_templates
FOR SELECT
USING (is_admin(auth.uid()));

-- Quote Templates: Allow admins to view all quote templates
CREATE POLICY "Admins can view all quote templates"
ON public.quote_templates
FOR SELECT
USING (is_admin(auth.uid()));

-- Contract Templates: Allow admins to view all contract templates
CREATE POLICY "Admins can view all contract templates"
ON public.contract_templates
FOR SELECT
USING (is_admin(auth.uid()));