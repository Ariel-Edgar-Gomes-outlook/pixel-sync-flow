-- Garantir que ao eliminar um cliente, todos os dados relacionados sejam eliminados
-- Primeiro, vamos verificar e ajustar as foreign keys para usar CASCADE

-- Jobs relacionados ao cliente
ALTER TABLE jobs
DROP CONSTRAINT IF EXISTS jobs_client_id_fkey,
ADD CONSTRAINT jobs_client_id_fkey 
  FOREIGN KEY (client_id) 
  REFERENCES clients(id) 
  ON DELETE CASCADE;

-- Quotes relacionados ao cliente
ALTER TABLE quotes
DROP CONSTRAINT IF EXISTS quotes_client_id_fkey,
ADD CONSTRAINT quotes_client_id_fkey 
  FOREIGN KEY (client_id) 
  REFERENCES clients(id) 
  ON DELETE CASCADE;

-- Contracts relacionados ao cliente
ALTER TABLE contracts
DROP CONSTRAINT IF EXISTS contracts_client_id_fkey,
ADD CONSTRAINT contracts_client_id_fkey 
  FOREIGN KEY (client_id) 
  REFERENCES clients(id) 
  ON DELETE CASCADE;

-- Invoices relacionados ao cliente
ALTER TABLE invoices
DROP CONSTRAINT IF EXISTS invoices_client_id_fkey,
ADD CONSTRAINT invoices_client_id_fkey 
  FOREIGN KEY (client_id) 
  REFERENCES clients(id) 
  ON DELETE CASCADE;

-- Payments relacionados ao cliente
ALTER TABLE payments
DROP CONSTRAINT IF EXISTS payments_client_id_fkey,
ADD CONSTRAINT payments_client_id_fkey 
  FOREIGN KEY (client_id) 
  REFERENCES clients(id) 
  ON DELETE CASCADE;

-- Leads relacionados ao cliente
ALTER TABLE leads
DROP CONSTRAINT IF EXISTS leads_client_id_fkey,
ADD CONSTRAINT leads_client_id_fkey 
  FOREIGN KEY (client_id) 
  REFERENCES clients(id) 
  ON DELETE CASCADE;