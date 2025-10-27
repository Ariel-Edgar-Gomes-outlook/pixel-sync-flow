import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Payment {
  id: string;
  client_id: string;
  quote_id: string | null;
  amount: number;
  type: string;
  status: 'pending' | 'paid' | 'partial' | 'refunded';
  method: string | null;
  currency: string | null;
  paid_at: string | null;
  notes: string | null;
  receipt_sent_at: string | null;
  invoice_id: string | null;
  payment_plan_id: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          clients (
            id,
            name,
            email
          )
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('payments')
        .insert([{ ...payment, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Payment> & { id: string }) => {
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('🔄 useDeletePayment: Iniciando delete para ID:', id);
      
      const { data, error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id)
        .select();

      console.log('📊 Resultado do delete:', { data, error });

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }
      
      console.log('✅ Delete executado com sucesso');
      return data;
    },
    onSuccess: () => {
      console.log('🔄 Invalidando queries...');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      console.error('❌ Erro na mutação:', error);
    }
  });
}
