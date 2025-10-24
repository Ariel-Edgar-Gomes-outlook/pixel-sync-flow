import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Contract {
  id: string;
  client_id: string;
  job_id: string | null;
  status: 'draft' | 'sent' | 'pending_signature' | 'signed' | 'active' | 'cancelled';
  terms_text: string | null;
  usage_rights_text?: string | null;
  cancellation_policy_text?: string | null;
  late_delivery_clause?: string | null;
  copyright_notice?: string | null;
  reschedule_policy?: string | null;
  revision_policy?: string | null;
  signature_url?: string | null;
  signature_token?: string | null;
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
    mutationFn: async (contract: any) => {
      const { data, error } = await supabase
        .from('contracts')
        .insert(contract as any)
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
    mutationFn: async ({ id, ...updates }: any) => {
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