import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Checklist {
  id: string;
  job_id: string;
  type: string;
  items: ChecklistItem[];
  estimated_time: number | null;
  created_at: string;
  updated_at: string;
}

export function useChecklistsByJob(jobId: string | undefined) {
  return useQuery({
    queryKey: ['checklists', jobId],
    queryFn: async () => {
      if (!jobId) return [];

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
        .from('checklists')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(item => ({
        ...item,
        items: item.items as unknown as ChecklistItem[]
      }));
    },
    enabled: !!jobId,
  });
}

export function useCreateChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (checklist: Partial<Checklist>) => {
      const { data, error } = await supabase
        .from('checklists')
        .insert({
          job_id: checklist.job_id!,
          type: checklist.type!,
          items: checklist.items as any,
          estimated_time: checklist.estimated_time
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['checklists', data.job_id] });
    },
  });
}

export function useUpdateChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Checklist> & { id: string }) => {
      const { data, error } = await supabase
        .from('checklists')
        .update({
          ...updates,
          items: updates.items as any
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['checklists', data.job_id] });
    },
  });
}

export function useDeleteChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, job_id }: { id: string; job_id: string }) => {
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, job_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['checklists', data.job_id] });
    },
  });
}