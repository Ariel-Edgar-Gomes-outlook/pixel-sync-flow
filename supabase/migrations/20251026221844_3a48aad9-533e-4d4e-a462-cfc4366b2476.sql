
-- ============================================
-- CORREÇÃO URGENTE: DELETAR DADOS ÓRFÃOS
-- Dados sem created_by causam vazamento entre usuários
-- ============================================

-- 1. Deletar notificações dos jobs órfãos
DELETE FROM notifications 
WHERE (payload->>'job_id')::uuid IN (
  SELECT id FROM jobs WHERE created_by IS NULL
);

-- 2. Deletar dependências dos jobs órfãos
DELETE FROM checklists WHERE job_id IN (SELECT id FROM jobs WHERE created_by IS NULL);
DELETE FROM deliverables WHERE job_id IN (SELECT id FROM jobs WHERE created_by IS NULL);
DELETE FROM job_resources WHERE job_id IN (SELECT id FROM jobs WHERE created_by IS NULL);
DELETE FROM job_team_members WHERE job_id IN (SELECT id FROM jobs WHERE created_by IS NULL);
DELETE FROM client_galleries WHERE job_id IN (SELECT id FROM jobs WHERE created_by IS NULL);
DELETE FROM time_entries WHERE job_id IN (SELECT id FROM jobs WHERE created_by IS NULL);

-- 3. Deletar jobs órfãos
DELETE FROM jobs WHERE created_by IS NULL;

-- 4. Deletar contratos de clientes órfãos
DELETE FROM contracts WHERE client_id IN (SELECT id FROM clients WHERE created_by IS NULL);

-- 5. Deletar quotes de clientes órfãos
DELETE FROM quotes WHERE client_id IN (SELECT id FROM clients WHERE created_by IS NULL);

-- 6. Deletar leads de clientes órfãos
DELETE FROM leads WHERE client_id IN (SELECT id FROM clients WHERE created_by IS NULL);

-- 7. Deletar payments de clientes órfãos
DELETE FROM payments WHERE client_id IN (SELECT id FROM clients WHERE created_by IS NULL);

-- 8. Deletar clientes órfãos
DELETE FROM clients WHERE created_by IS NULL;

-- 9. Deletar quotes órfãos diretos
DELETE FROM quotes WHERE created_by IS NULL;

-- 10. Deletar payments órfãos diretos
DELETE FROM payments WHERE created_by IS NULL;

-- 11. Deletar resources órfãos
DELETE FROM resources WHERE created_by IS NULL;

-- 12. Aplicar constraints NOT NULL
ALTER TABLE jobs ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE clients ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE quotes ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE payments ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE resources ALTER COLUMN created_by SET NOT NULL;