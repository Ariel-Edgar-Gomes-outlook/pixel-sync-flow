-- Function to sync payment with invoice and quote status
CREATE OR REPLACE FUNCTION sync_payment_to_invoice_and_quote()
RETURNS TRIGGER AS $$
DECLARE
  v_invoice_total numeric;
  v_total_paid numeric;
  v_invoice_id uuid;
  v_quote_id uuid;
BEGIN
  -- Get invoice_id from payment or from quote
  v_invoice_id := NEW.invoice_id;
  v_quote_id := NEW.quote_id;
  
  -- If no direct invoice_id but has quote_id, try to find invoice from quote
  IF v_invoice_id IS NULL AND v_quote_id IS NOT NULL THEN
    SELECT id INTO v_invoice_id 
    FROM invoices 
    WHERE quote_id = v_quote_id 
    LIMIT 1;
  END IF;
  
  -- Update invoice if found
  IF v_invoice_id IS NOT NULL THEN
    -- Calculate total paid for this invoice
    SELECT 
      COALESCE(SUM(amount), 0) INTO v_total_paid
    FROM payments
    WHERE invoice_id = v_invoice_id 
      AND status = 'paid';
    
    -- Get invoice total
    SELECT total INTO v_invoice_total
    FROM invoices
    WHERE id = v_invoice_id;
    
    -- Update invoice amount_paid and status
    IF v_total_paid >= v_invoice_total THEN
      -- Fully paid
      UPDATE invoices
      SET 
        amount_paid = v_total_paid,
        status = 'paid',
        paid_date = NOW(),
        updated_at = NOW()
      WHERE id = v_invoice_id;
    ELSIF v_total_paid > 0 THEN
      -- Partially paid
      UPDATE invoices
      SET 
        amount_paid = v_total_paid,
        status = 'partial',
        updated_at = NOW()
      WHERE id = v_invoice_id;
    ELSE
      -- Not paid yet
      UPDATE invoices
      SET 
        amount_paid = 0,
        status = 'issued',
        paid_date = NULL,
        updated_at = NOW()
      WHERE id = v_invoice_id;
    END IF;
  END IF;
  
  -- Update quote if found
  IF v_quote_id IS NOT NULL THEN
    DECLARE
      v_quote_total numeric;
      v_quote_paid numeric;
    BEGIN
      -- Calculate total paid for this quote
      SELECT 
        COALESCE(SUM(amount), 0) INTO v_quote_paid
      FROM payments
      WHERE quote_id = v_quote_id 
        AND status = 'paid';
      
      -- Get quote total
      SELECT total INTO v_quote_total
      FROM quotes
      WHERE id = v_quote_id;
      
      -- Update quote status based on payments
      IF v_quote_paid >= v_quote_total THEN
        UPDATE quotes
        SET 
          status = 'accepted',
          accepted_at = NOW(),
          updated_at = NOW()
        WHERE id = v_quote_id
          AND status != 'accepted'; -- Only update if not already accepted
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_sync_payment_to_invoice_and_quote ON payments;

-- Create trigger on payments table
CREATE TRIGGER trigger_sync_payment_to_invoice_and_quote
  AFTER INSERT OR UPDATE OF amount, status, invoice_id, quote_id
  ON payments
  FOR EACH ROW
  EXECUTE FUNCTION sync_payment_to_invoice_and_quote();

COMMENT ON FUNCTION sync_payment_to_invoice_and_quote() IS 
'Automatically syncs payment status to invoices and quotes. Updates amount_paid, status, and paid_date based on total payments received.';