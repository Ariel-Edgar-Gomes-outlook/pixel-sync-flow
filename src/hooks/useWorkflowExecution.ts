import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WorkflowTemplate, WorkflowResult } from '@/types/workflows';

interface ExecuteWorkflowParams {
  template: WorkflowTemplate;
  sourceId: string;
  sourceData: any;
}

/**
 * Hook for executing predefined workflows
 * FASE 3.7: Automates complex multi-step processes
 */
export function useWorkflowExecution() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState(0);

  const executeWorkflow = async ({
    template,
    sourceId,
    sourceData,
  }: ExecuteWorkflowParams): Promise<WorkflowResult> => {
    setIsExecuting(true);
    setProgress(0);

    const result: WorkflowResult = {
      success: false,
      createdEntities: [],
    };

    try {
      switch (template) {
        case 'quote_to_job':
          return await executeQuoteToJob(sourceId, sourceData);
        
        case 'job_to_invoice':
          return await executeJobToInvoice(sourceId, sourceData);
        
        case 'payment_to_receipt':
          return await executePaymentToReceipt(sourceId, sourceData);
        
        case 'lead_to_quote':
          return await executeLeadToQuote(sourceId, sourceData);
        
        case 'job_complete_flow':
          return await executeJobCompleteFlow(sourceId, sourceData);
        
        default:
          throw new Error('Workflow template not found');
      }
    } catch (error: any) {
      console.error('Workflow execution error:', error);
      result.error = error.message;
      toast.error(`Erro ao executar workflow: ${error.message}`);
      return result;
    } finally {
      setIsExecuting(false);
      setProgress(100);
    }
  };

  // WORKFLOW 1: Quote Accepted → Create Job + Contract
  const executeQuoteToJob = async (quoteId: string, quoteData: any): Promise<WorkflowResult> => {
    const result: WorkflowResult = { success: false, createdEntities: [] };

    try {
      setProgress(20);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Step 1: Create Job
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
          client_id: quoteData.client_id,
          title: `Job - ${quoteData.clients?.name || 'Cliente'}`,
          type: 'photography',
          status: 'confirmed',
          start_datetime: new Date().toISOString(),
          estimated_revenue: quoteData.total,
          created_by: user.id,
        })
        .select()
        .single();

      if (jobError) throw jobError;
      result.createdEntities.push({ type: 'job', id: job.id });
      setProgress(50);

      // Step 2: Update Quote with Job ID
      await supabase
        .from('quotes')
        .update({ 
          job_id: job.id,
          converted_to_job_at: new Date().toISOString()
        })
        .eq('id', quoteId);

      setProgress(70);

      // Step 3: Create Contract (optional)
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .insert({
          client_id: quoteData.client_id,
          job_id: job.id,
          status: 'draft',
          clauses: {
            payment_terms: `Valor: ${quoteData.total} ${quoteData.currency}`,
            services: 'Conforme orçamento aprovado',
          },
        })
        .select()
        .single();

      if (!contractError && contract) {
        result.createdEntities.push({ type: 'contract', id: contract.id });
      }

      setProgress(100);
      result.success = true;
      toast.success('✅ Job e Contrato criados com sucesso!');
      
      return result;
    } catch (error: any) {
      result.error = error.message;
      throw error;
    }
  };

  // WORKFLOW 2: Job Completed → Create Invoice
  const executeJobToInvoice = async (jobId: string, jobData: any): Promise<WorkflowResult> => {
    const result: WorkflowResult = { success: false, createdEntities: [] };

    try {
      setProgress(30);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get business settings for invoice numbering
      const { data: settings } = await supabase
        .from('business_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const invoiceNumber = `${settings?.invoice_prefix || 'FT'}${String(settings?.next_invoice_number || 1).padStart(4, '0')}`;

      // Create Invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          client_id: jobData.client_id,
          job_id: jobId,
          invoice_number: invoiceNumber,
          user_id: user.id,
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          items: [{
            description: jobData.title || 'Serviço fotográfico',
            quantity: 1,
            unit_price: jobData.estimated_revenue || 0,
            total: jobData.estimated_revenue || 0,
          }],
          subtotal: jobData.estimated_revenue || 0,
          total: jobData.estimated_revenue || 0,
          tax_amount: 0,
          status: 'issued',
          currency: 'AOA',
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Update invoice counter
      if (settings?.id) {
        await supabase
          .from('business_settings')
          .update({ next_invoice_number: (settings.next_invoice_number || 1) + 1 })
          .eq('id', settings.id);
      }

      setProgress(100);
      result.createdEntities.push({ type: 'invoice', id: invoice.id });
      result.success = true;
      toast.success('✅ Fatura criada com sucesso!');
      
      return result;
    } catch (error: any) {
      result.error = error.message;
      throw error;
    }
  };

  // WORKFLOW 3: Payment Received → Generate Receipt
  const executePaymentToReceipt = async (paymentId: string, paymentData: any): Promise<WorkflowResult> => {
    const result: WorkflowResult = { success: false, createdEntities: [] };

    try {
      setProgress(50);

      // Update payment status to paid
      const { error: updateError } = await supabase
        .from('payments')
        .update({ 
          status: 'paid'
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      setProgress(100);
      result.success = true;
      toast.success('✅ Recibo gerado com sucesso!');
      
      return result;
    } catch (error: any) {
      result.error = error.message;
      throw error;
    }
  };

  // WORKFLOW 4: Lead Contacted → Create Quote
  const executeLeadToQuote = async (leadId: string, leadData: any): Promise<WorkflowResult> => {
    const result: WorkflowResult = { success: false, createdEntities: [] };

    try {
      setProgress(30);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create Quote
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          client_id: leadData.client_id,
          created_by: user.id,
          items: [
            {
              description: 'Serviço fotográfico',
              quantity: 1,
              unit_price: 0,
              total: 0,
            }
          ],
          total: 0,
          tax: 0,
          discount: 0,
          status: 'draft',
          currency: 'AOA',
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      setProgress(100);
      result.createdEntities.push({ type: 'quote', id: quote.id });
      result.success = true;
      toast.success('✅ Orçamento criado! Complete os detalhes.');
      
      return result;
    } catch (error: any) {
      result.error = error.message;
      throw error;
    }
  };

  // WORKFLOW 5: Job Complete Flow (Invoice + Notification)
  const executeJobCompleteFlow = async (jobId: string, jobData: any): Promise<WorkflowResult> => {
    const result: WorkflowResult = { success: false, createdEntities: [] };

    try {
      // Update job status
      await supabase
        .from('jobs')
        .update({ status: 'completed' })
        .eq('id', jobId);

      // Create invoice
      const invoiceResult = await executeJobToInvoice(jobId, jobData);
      result.createdEntities.push(...invoiceResult.createdEntities);

      // Create notification
      const { data: user } = await supabase.auth.getUser();
      if (user?.user) {
        await supabase
          .from('notifications')
          .insert({
            recipient_id: user.user.id,
            type: 'job_completed',
            payload: {
              job_id: jobId,
              message: 'Job concluído! Fatura criada automaticamente.',
            }
          });
      }

      result.success = true;
      toast.success('✅ Job concluído e fatura criada!');
      
      return result;
    } catch (error: any) {
      result.error = error.message;
      throw error;
    }
  };

  return {
    executeWorkflow,
    isExecuting,
    progress,
  };
}
