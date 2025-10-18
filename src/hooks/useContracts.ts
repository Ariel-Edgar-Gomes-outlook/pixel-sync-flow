import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Contract {
  id: string;
  client_id: string;
  job_id: string | null;
  status: 'draft' | 'sent' | 'signed' | 'cancelled';
  terms_text: string | null;
  clauses: any;
  attachments_links: any;
  issued_at: string;
  signed_at: string | null;
  cancellation_fee: number | null;
  created_at: string;
  updated_at: string;
}

export function useContracts() {
  return useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          clients (
            id,
            name,
            email
          ),
          jobs (
            id,
            title,
            type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contract: Partial<Contract>) => {
      const { data, error } = await supabase
        .from('contracts')
        .insert({
          client_id: contract.client_id!,
          job_id: contract.job_id,
          status: contract.status,
          terms_text: contract.terms_text,
          clauses: contract.clauses as any,
          attachments_links: contract.attachments_links as any,
          issued_at: contract.issued_at,
          signed_at: contract.signed_at,
          cancellation_fee: contract.cancellation_fee
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
}

export function useUpdateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Contract> & { id: string }) => {
      const { data, error } = await supabase
        .from('contracts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
}