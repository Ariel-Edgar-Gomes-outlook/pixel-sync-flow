import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PaymentInstallment {
  percentage: number;
  amount: number;
  due_date: string;
  description: string;
  status: 'pending' | 'paid' | 'overdue';
  paid_at?: string;
  payment_id?: string;
}

export interface PaymentPlan {
  id: string;
  job_id: string | null;
  quote_id: string | null;
  total_amount: number;
  installments: PaymentInstallment[];
  created_at: string;
  updated_at: string;
}

export function usePaymentPlans(jobId?: string, quoteId?: string) {
  return useQuery({
    queryKey: ['payment-plans', jobId, quoteId],
    queryFn: async () => {
      let query = supabase
        .from('payment_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobId) {
        query = query.eq('job_id', jobId);
      }
      if (quoteId) {
        query = query.eq('quote_id', quoteId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePaymentPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: any) => {
      const { data, error } = await supabase
        .from('payment_plans')
        .insert([plan])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-plans'] });
    },
  });
}

export function useUpdatePaymentPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('payment_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-plans'] });
    },
  });
}
