-- Alterar moeda padrão para AOA (Kwanza Angolano) nas tabelas
ALTER TABLE quotes ALTER COLUMN currency SET DEFAULT 'AOA';
ALTER TABLE payments ALTER COLUMN currency SET DEFAULT 'AOA';