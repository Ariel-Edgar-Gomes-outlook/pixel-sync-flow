-- Add invoice_id to payments table for linking payments to invoices
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS invoice_id uuid REFERENCES invoices(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);

-- Add last_payment_date to invoices for tracking
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS last_payment_date timestamp with time zone;