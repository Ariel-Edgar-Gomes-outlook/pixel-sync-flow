-- FASE 1: Padronização de campos PDF em todas as tabelas
-- Renomear pdf_link para pdf_url em quotes
ALTER TABLE quotes RENAME COLUMN pdf_link TO pdf_url;

-- Adicionar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_quotes_pdf_url ON quotes(pdf_url) WHERE pdf_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contracts_pdf_url ON contracts(pdf_url) WHERE pdf_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_pdf_url ON invoices(pdf_url) WHERE pdf_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_receipt_link ON payments(receipt_link) WHERE receipt_link IS NOT NULL;

-- Comentários para documentação
COMMENT ON COLUMN quotes.pdf_url IS 'URL pública do PDF do orçamento gerado';
COMMENT ON COLUMN contracts.pdf_url IS 'URL pública do PDF do contrato gerado';
COMMENT ON COLUMN invoices.pdf_url IS 'URL pública do PDF da fatura gerada';
COMMENT ON COLUMN payments.receipt_link IS 'URL pública do recibo de pagamento';