import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  is_proforma: boolean;
  client_id: string;
  quote_id: string | null;
  job_id: string | null;
  issue_date: string;
  due_date: string | null;
  paid_date: string | null;
  items: any;
  subtotal: number;
  tax_rate: number;
  tax_amount: number | null;
  discount_amount: number;
  total: number;
  currency: string;
  status: 'issued' | 'paid' | 'overdue' | 'cancelled' | 'partial';
  amount_paid: number;
  notes: string | null;
  payment_instructions: string | null;
  created_at: string;
  updated_at: string;
}

export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (
            id,
            name,
            email,
            phone
          ),
          quotes (
            id,
            status
          ),
          jobs (
            id,
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (
            id,
            name,
            email,
            phone,
            address
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoice: any) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert([invoice])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Fatura criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar fatura: ' + error.message);
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Invoice> & { id: string }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Fatura atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar fatura: ' + error.message);
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Fatura eliminada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao eliminar fatura: ' + error.message);
    },
  });
}

export function useInvoiceStats() {
  return useQuery({
    queryKey: ['invoice-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('status, total, amount_paid');

      if (error) throw error;

      const stats = {
        totalInvoiced: 0,
        totalPending: 0,
        totalOverdue: 0,
        totalPaid: 0,
        invoiceCount: data.length,
        paidCount: 0,
        pendingCount: 0,
        overdueCount: 0,
      };

      data.forEach((invoice: any) => {
        stats.totalInvoiced += Number(invoice.total);
        
        if (invoice.status === 'paid') {
          stats.totalPaid += Number(invoice.total);
          stats.paidCount++;
        } else if (invoice.status === 'overdue') {
          stats.totalOverdue += Number(invoice.total - invoice.amount_paid);
          stats.overdueCount++;
        } else if (invoice.status === 'issued' || invoice.status === 'partial') {
          stats.totalPending += Number(invoice.total - invoice.amount_paid);
          stats.pendingCount++;
        }
      });

      return stats;
    },
  });
}
