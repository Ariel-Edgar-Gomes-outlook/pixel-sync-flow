-- Corrigir RLS policies para permitir usuários deletarem seus próprios templates

-- Quote Templates
DROP POLICY IF EXISTS "Owners and admins can delete quote templates" ON quote_templates;

CREATE POLICY "Users can delete own quote templates"
ON quote_templates
FOR DELETE
USING (created_by = auth.uid());

-- Checklist Templates  
DROP POLICY IF EXISTS "Owners and admins can delete checklist templates" ON checklist_templates;

CREATE POLICY "Users can delete own checklist templates"
ON checklist_templates
FOR DELETE
USING (created_by = auth.uid());

-- Contract Templates
DROP POLICY IF EXISTS "Owners and admins can delete contract templates" ON contract_templates;

CREATE POLICY "Users can delete own contract templates"
ON contract_templates
FOR DELETE
USING (created_by = auth.uid());