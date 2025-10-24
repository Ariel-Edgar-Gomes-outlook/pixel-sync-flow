-- ============================================
-- FASE 1: ADICIONAR CAMPOS created_by ONDE FALTAM
-- ============================================

-- Adicionar created_by à tabela quotes (se não existir)
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Adicionar created_by à tabela payments (se não existir)
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Atualizar registos existentes de quotes com base nos invoices relacionados
UPDATE public.quotes 
SET created_by = (
  SELECT user_id FROM invoices WHERE invoices.quote_id = quotes.id LIMIT 1
)
WHERE created_by IS NULL;

-- Atualizar registos existentes de payments com base nos invoices relacionados
UPDATE public.payments 
SET created_by = (
  SELECT user_id FROM invoices WHERE invoices.id = payments.invoice_id LIMIT 1
)
WHERE created_by IS NULL;

-- ============================================
-- FASE 2: REMOVER POLÍTICAS RLS INSEGURAS
-- ============================================

-- Tabela clients
DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON public.clients;

-- Tabela jobs
DROP POLICY IF EXISTS "Authenticated users can view jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can insert jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can update jobs" ON public.jobs;

-- Tabela invoices
DROP POLICY IF EXISTS "Authenticated users can view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can update invoices" ON public.invoices;

-- Tabela quotes
DROP POLICY IF EXISTS "Authenticated users can view quotes" ON public.quotes;
DROP POLICY IF EXISTS "Authenticated users can insert quotes" ON public.quotes;
DROP POLICY IF EXISTS "Authenticated users can update quotes" ON public.quotes;

-- Tabela payments
DROP POLICY IF EXISTS "Authenticated users can view payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can update payments" ON public.payments;

-- Tabela leads
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.leads;

-- Tabela contracts
DROP POLICY IF EXISTS "Authenticated users can view contracts" ON public.contracts;
DROP POLICY IF EXISTS "Authenticated users can insert contracts" ON public.contracts;
DROP POLICY IF EXISTS "Authenticated users can update contracts" ON public.contracts;

-- Tabela deliverables
DROP POLICY IF EXISTS "Authenticated users can view deliverables" ON public.deliverables;
DROP POLICY IF EXISTS "Authenticated users can insert deliverables" ON public.deliverables;
DROP POLICY IF EXISTS "Authenticated users can update deliverables" ON public.deliverables;

-- Tabela resources
DROP POLICY IF EXISTS "Authenticated users can view resources" ON public.resources;
DROP POLICY IF EXISTS "Authenticated users can insert resources" ON public.resources;
DROP POLICY IF EXISTS "Authenticated users can update resources" ON public.resources;

-- Tabela team_members
DROP POLICY IF EXISTS "Authenticated users can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Authenticated users can insert team members" ON public.team_members;
DROP POLICY IF EXISTS "Authenticated users can update team members" ON public.team_members;

-- Tabela contract_templates
DROP POLICY IF EXISTS "Authenticated users can view contract templates" ON public.contract_templates;
DROP POLICY IF EXISTS "Authenticated users can insert contract templates" ON public.contract_templates;
DROP POLICY IF EXISTS "Authenticated users can update contract templates" ON public.contract_templates;

-- Tabela quote_templates
DROP POLICY IF EXISTS "Authenticated users can view quote templates" ON public.quote_templates;
DROP POLICY IF EXISTS "Authenticated users can insert quote templates" ON public.quote_templates;
DROP POLICY IF EXISTS "Authenticated users can update quote templates" ON public.quote_templates;

-- Tabela checklist_templates
DROP POLICY IF EXISTS "Authenticated users can view checklist templates" ON public.checklist_templates;
DROP POLICY IF EXISTS "Authenticated users can insert checklist templates" ON public.checklist_templates;
DROP POLICY IF EXISTS "Authenticated users can update checklist templates" ON public.checklist_templates;

-- Tabela checklists
DROP POLICY IF EXISTS "Authenticated users can view checklists" ON public.checklists;
DROP POLICY IF EXISTS "Authenticated users can insert checklists" ON public.checklists;
DROP POLICY IF EXISTS "Authenticated users can update checklists" ON public.checklists;

-- Tabela time_entries
DROP POLICY IF EXISTS "Authenticated users can view time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Authenticated users can insert time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Authenticated users can update time entries" ON public.time_entries;

-- Tabela job_resources
DROP POLICY IF EXISTS "Authenticated users can view job resources" ON public.job_resources;
DROP POLICY IF EXISTS "Authenticated users can insert job resources" ON public.job_resources;
DROP POLICY IF EXISTS "Authenticated users can update job resources" ON public.job_resources;

-- Tabela job_team_members
DROP POLICY IF EXISTS "Authenticated users can view job team members" ON public.job_team_members;
DROP POLICY IF EXISTS "Authenticated users can insert job team members" ON public.job_team_members;
DROP POLICY IF EXISTS "Authenticated users can update job team members" ON public.job_team_members;

-- Tabela client_galleries
DROP POLICY IF EXISTS "Authenticated users can view galleries" ON public.client_galleries;
DROP POLICY IF EXISTS "Authenticated users can insert galleries" ON public.client_galleries;
DROP POLICY IF EXISTS "Authenticated users can update galleries" ON public.client_galleries;

-- Tabela gallery_photos
DROP POLICY IF EXISTS "Authenticated users can view gallery photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Authenticated users can insert gallery photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Authenticated users can update gallery photos" ON public.gallery_photos;

-- Tabela payment_plans
DROP POLICY IF EXISTS "Authenticated users can view payment plans" ON public.payment_plans;
DROP POLICY IF EXISTS "Authenticated users can insert payment plans" ON public.payment_plans;
DROP POLICY IF EXISTS "Authenticated users can update payment plans" ON public.payment_plans;

-- Tabela payment_reminders
DROP POLICY IF EXISTS "Authenticated users can view payment reminders" ON public.payment_reminders;
DROP POLICY IF EXISTS "Authenticated users can insert payment reminders" ON public.payment_reminders;

-- ============================================
-- FASE 3: CRIAR POLÍTICAS RLS SEGURAS
-- ============================================

-- CLIENTS: Isolamento por created_by
CREATE POLICY "Users can view own clients"
ON public.clients FOR SELECT
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Users can insert own clients"
ON public.clients FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own clients"
ON public.clients FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- JOBS: Isolamento por created_by
CREATE POLICY "Users can view own jobs"
ON public.jobs FOR SELECT
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Users can insert own jobs"
ON public.jobs FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own jobs"
ON public.jobs FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- INVOICES: Isolamento por user_id
CREATE POLICY "Users can view own invoices"
ON public.invoices FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own invoices"
ON public.invoices FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own invoices"
ON public.invoices FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- QUOTES: Isolamento por created_by
CREATE POLICY "Users can view own quotes"
ON public.quotes FOR SELECT
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Users can insert own quotes"
ON public.quotes FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own quotes"
ON public.quotes FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- PAYMENTS: Isolamento por created_by
CREATE POLICY "Users can view own payments"
ON public.payments FOR SELECT
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Users can insert own payments"
ON public.payments FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own payments"
ON public.payments FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- LEADS: Isolamento via clients.created_by
CREATE POLICY "Users can view own leads"
ON public.leads FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT id FROM public.clients WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can insert leads for own clients"
ON public.leads FOR INSERT
TO authenticated
WITH CHECK (
  client_id IN (
    SELECT id FROM public.clients WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can update own leads"
ON public.leads FOR UPDATE
TO authenticated
USING (
  client_id IN (
    SELECT id FROM public.clients WHERE created_by = auth.uid()
  )
)
WITH CHECK (
  client_id IN (
    SELECT id FROM public.clients WHERE created_by = auth.uid()
  )
);

-- CONTRACTS: Isolamento via clients.created_by
CREATE POLICY "Users can view own contracts"
ON public.contracts FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT id FROM public.clients WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can insert contracts for own clients"
ON public.contracts FOR INSERT
TO authenticated
WITH CHECK (
  client_id IN (
    SELECT id FROM public.clients WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can update own contracts"
ON public.contracts FOR UPDATE
TO authenticated
USING (
  client_id IN (
    SELECT id FROM public.clients WHERE created_by = auth.uid()
  )
)
WITH CHECK (
  client_id IN (
    SELECT id FROM public.clients WHERE created_by = auth.uid()
  )
);

-- DELIVERABLES: Isolamento via jobs.created_by
CREATE POLICY "Users can view own deliverables"
ON public.deliverables FOR SELECT
TO authenticated
USING (
  job_id IN (
    SELECT id FROM public.jobs WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can insert deliverables for own jobs"
ON public.deliverables FOR INSERT
TO authenticated
WITH CHECK (
  job_id IN (
    SELECT id FROM public.jobs WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can update own deliverables"
ON public.deliverables FOR UPDATE
TO authenticated
USING (
  job_id IN (
    SELECT id FROM public.jobs WHERE created_by = auth.uid()
  )
)
WITH CHECK (
  job_id IN (
    SELECT id FROM public.jobs WHERE created_by = auth.uid()
  )
);

-- RESOURCES: Isolamento por created_by (precisa adicionar coluna)
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

CREATE POLICY "Users can view own resources"
ON public.resources FOR SELECT
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Users can insert own resources"
ON public.resources FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own resources"
ON public.resources FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- TEAM_MEMBERS: Isolamento por created_by
CREATE POLICY "Users can view own team members"
ON public.team_members FOR SELECT
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Users can insert own team members"
ON public.team_members FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own team members"
ON public.team_members FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- CONTRACT_TEMPLATES: Isolamento por created_by
CREATE POLICY "Users can view own contract templates"
ON public.contract_templates FOR SELECT
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Users can insert own contract templates"
ON public.contract_templates FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own contract templates"
ON public.contract_templates FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- QUOTE_TEMPLATES: Isolamento por created_by
CREATE POLICY "Users can view own quote templates"
ON public.quote_templates FOR SELECT
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Users can insert own quote templates"
ON public.quote_templates FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own quote templates"
ON public.quote_templates FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- CHECKLIST_TEMPLATES: Isolamento por created_by
CREATE POLICY "Users can view own checklist templates"
ON public.checklist_templates FOR SELECT
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Users can insert own checklist templates"
ON public.checklist_templates FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own checklist templates"
ON public.checklist_templates FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- CHECKLISTS: Isolamento via jobs.created_by
CREATE POLICY "Users can view own checklists"
ON public.checklists FOR SELECT
TO authenticated
USING (
  job_id IN (
    SELECT id FROM public.jobs WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can insert checklists for own jobs"
ON public.checklists FOR INSERT
TO authenticated
WITH CHECK (
  job_id IN (
    SELECT id FROM public.jobs WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can update own checklists"
ON public.checklists FOR UPDATE
TO authenticated
USING (
  job_id IN (
    SELECT id FROM public.jobs WHERE created_by = auth.uid()
  )
)
WITH CHECK (
  job_id IN (
    SELECT id FROM public.jobs WHERE created_by = auth.uid()
  )
);

-- TIME_ENTRIES: Isolamento por user_id
CREATE POLICY "Users can view own time entries"
ON public.time_entries FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own time entries"
ON public.time_entries FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own time entries"
ON public.time_entries FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- JOB_RESOURCES: Isolamento via jobs.created_by
CREATE POLICY "Users can view own job resources"
ON public.job_resources FOR SELECT
TO authenticated
USING (
  job_id IN (
    SELECT id FROM public.jobs WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can insert job resources for own jobs"
ON public.job_resources FOR INSERT
TO authenticated
WITH CHECK (
  job_id IN (
    SELECT id FROM public.jobs WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can update own job resources"
ON public.job_resources FOR UPDATE
TO authenticated
USING (
  job_id IN (
    SELECT id FROM public.jobs WHERE created_by = auth.uid()
  )
)
WITH CHECK (
  job_id IN (
    SELECT id FROM public.jobs WHERE created_by = auth.uid()
  )
);

-- JOB_TEAM_MEMBERS: Isolamento via jobs.created_by
CREATE POLICY "Users can view own job team members"
ON public.job_team_members FOR SELECT
TO authenticated
USING (
  job_id IN (
    SELECT id FROM public.jobs WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can insert job team members for own jobs"
ON public.job_team_members FOR INSERT
TO authenticated
WITH CHECK (
  job_id IN (
    SELECT id FROM public.jobs WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can update own job team members"
ON public.job_team_members FOR UPDATE
TO authenticated
USING (
  job_id IN (
    SELECT id FROM public.jobs WHERE created_by = auth.uid()
  )
)
WITH CHECK (
  job_id IN (
    SELECT id FROM public.jobs WHERE created_by = auth.uid()
  )
);

-- CLIENT_GALLERIES: Isolamento via jobs.created_by
CREATE POLICY "Users can view own galleries"
ON public.client_galleries FOR SELECT
TO authenticated
USING (
  job_id IN (
    SELECT id FROM public.jobs WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can insert galleries for own jobs"
ON public.client_galleries FOR INSERT
TO authenticated
WITH CHECK (
  job_id IN (
    SELECT id FROM public.jobs WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can update own galleries"
ON public.client_galleries FOR UPDATE
TO authenticated
USING (
  job_id IN (
    SELECT id FROM public.jobs WHERE created_by = auth.uid()
  )
)
WITH CHECK (
  job_id IN (
    SELECT id FROM public.jobs WHERE created_by = auth.uid()
  )
);

-- GALLERY_PHOTOS: Isolamento via client_galleries
CREATE POLICY "Users can view own gallery photos"
ON public.gallery_photos FOR SELECT
TO authenticated
USING (
  gallery_id IN (
    SELECT id FROM public.client_galleries WHERE job_id IN (
      SELECT id FROM public.jobs WHERE created_by = auth.uid()
    )
  )
);

CREATE POLICY "Users can insert gallery photos for own galleries"
ON public.gallery_photos FOR INSERT
TO authenticated
WITH CHECK (
  gallery_id IN (
    SELECT id FROM public.client_galleries WHERE job_id IN (
      SELECT id FROM public.jobs WHERE created_by = auth.uid()
    )
  )
);

CREATE POLICY "Users can update own gallery photos"
ON public.gallery_photos FOR UPDATE
TO authenticated
USING (
  gallery_id IN (
    SELECT id FROM public.client_galleries WHERE job_id IN (
      SELECT id FROM public.jobs WHERE created_by = auth.uid()
    )
  )
)
WITH CHECK (
  gallery_id IN (
    SELECT id FROM public.client_galleries WHERE job_id IN (
      SELECT id FROM public.jobs WHERE created_by = auth.uid()
    )
  )
);

-- PAYMENT_PLANS: Isolamento via quotes.created_by
CREATE POLICY "Users can view own payment plans"
ON public.payment_plans FOR SELECT
TO authenticated
USING (
  quote_id IN (
    SELECT id FROM public.quotes WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can insert payment plans for own quotes"
ON public.payment_plans FOR INSERT
TO authenticated
WITH CHECK (
  quote_id IN (
    SELECT id FROM public.quotes WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can update own payment plans"
ON public.payment_plans FOR UPDATE
TO authenticated
USING (
  quote_id IN (
    SELECT id FROM public.quotes WHERE created_by = auth.uid()
  )
)
WITH CHECK (
  quote_id IN (
    SELECT id FROM public.quotes WHERE created_by = auth.uid()
  )
);

-- PAYMENT_REMINDERS: Isolamento via payments.created_by
CREATE POLICY "Users can view own payment reminders"
ON public.payment_reminders FOR SELECT
TO authenticated
USING (
  payment_id IN (
    SELECT id FROM public.payments WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can insert payment reminders for own payments"
ON public.payment_reminders FOR INSERT
TO authenticated
WITH CHECK (
  payment_id IN (
    SELECT id FROM public.payments WHERE created_by = auth.uid()
  )
);