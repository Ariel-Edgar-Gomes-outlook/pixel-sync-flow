import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Deliverable {
  id: string;
  job_id: string;
  type: string;
  file_url: string | null;
  file_name: string;
  file_size: number | null;
  uploaded_at: string;
  sent_to_client_at: string | null;
  downloaded_at: string | null;
  created_by: string | null;
  external_platform: string | null;
  access_instructions: string | null;
  version: string;
}

export function useDeliverables(jobId: string) {
  return useQuery({
    queryKey: ['deliverables', jobId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: job } = await supabase
        .from('jobs')
        .select('id')
        .eq('id', jobId)
        .eq('created_by', user.id)
        .single();

      if (!job) throw new Error('Job not found or access denied');

      const { data, error } = await supabase
        .from('deliverables')
        .select('*')
        .eq('job_id', jobId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data as Deliverable[];
    },
  });
}

export function useCreateDeliverable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deliverable: Omit<Deliverable, 'id' | 'uploaded_at' | 'created_by' | 'sent_to_client_at' | 'downloaded_at' | 'version'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('deliverables')
        .insert({ ...deliverable, created_by: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deliverables', variables.job_id] });
      toast.success('Arquivo adicionado aos entregáveis!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar arquivo');
      console.error('Error creating deliverable:', error);
    },
  });
}

export function useMarkDeliverableAsSent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, jobId }: { id: string; jobId: string }) => {
      const { data, error } = await supabase
        .from('deliverables')
        .update({ sent_to_client_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deliverables', variables.jobId] });
      toast.success('Marcado como enviado ao cliente!');
    },
    onError: () => {
      toast.error('Erro ao atualizar status');
    },
  });
}

export function useDeleteDeliverable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, jobId }: { id: string; jobId: string }) => {
      const { error } = await supabase
        .from('deliverables')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deliverables', variables.jobId] });
      toast.success('Arquivo removido!');
    },
    onError: () => {
      toast.error('Erro ao remover arquivo');
    },
  });
}
