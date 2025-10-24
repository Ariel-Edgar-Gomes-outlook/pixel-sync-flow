import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useJobQuote(jobId: string | undefined) {
  return useQuery({
    queryKey: ['job-quote', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('job_id', jobId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });
}

export function useJobContract(jobId: string | undefined) {
  return useQuery({
    queryKey: ['job-contract', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('job_id', jobId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });
}

export function useJobInvoices(jobId: string | undefined) {
  return useQuery({
    queryKey: ['job-invoices', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });
}

export function useJobPayments(jobId: string | undefined) {
  return useQuery({
    queryKey: ['job-payments', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          invoices!inner(job_id)
        `)
        .eq('invoices.job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });
}

export function useJobDeliverables(jobId: string | undefined) {
  return useQuery({
    queryKey: ['job-deliverables', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      const { data, error } = await supabase
        .from('deliverables')
        .select('*')
        .eq('job_id', jobId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });
}

export function useJobResources(jobId: string | undefined) {
  return useQuery({
    queryKey: ['job-resources', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      const { data, error } = await supabase
        .from('job_resources')
        .select(`
          *,
          resources(id, name, type)
        `)
        .eq('job_id', jobId)
        .order('reserved_from', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });
}
