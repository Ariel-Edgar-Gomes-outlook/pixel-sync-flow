import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TimeEntry {
  id: string;
  job_id: string;
  user_id: string;
  description: string | null;
  hours: number;
  entry_date: string;
  created_at: string;
  updated_at: string;
}

export function useTimeEntries(jobId?: string) {
  return useQuery({
    queryKey: ['time-entries', jobId],
    queryFn: async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });

      if (jobId) {
        // Verify job belongs to user
        const { data: job } = await supabase
          .from('jobs')
          .select('id')
          .eq('id', jobId)
          .eq('created_by', user.id)
          .maybeSingle();

        if (!job) throw new Error('Job not found or access denied');
        
        query = query.eq('job_id', jobId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TimeEntry[];
    },
  });
}

export function useCreateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (timeEntry: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('time_entries')
        .insert({ ...timeEntry, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      // Update job time_spent
      const { data: entries } = await supabase
        .from('time_entries')
        .select('hours')
        .eq('job_id', timeEntry.job_id);

      if (entries) {
        const totalHours = entries.reduce((sum, entry) => sum + Number(entry.hours), 0);
        await supabase
          .from('jobs')
          .update({ time_spent: totalHours })
          .eq('id', timeEntry.job_id);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries', variables.job_id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Tempo registrado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao registrar tempo');
      console.error('Error creating time entry:', error);
    },
  });
}

export function useUpdateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...timeEntry }: Partial<TimeEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from('time_entries')
        .update(timeEntry)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update job time_spent
      if (data.job_id) {
        const { data: entries } = await supabase
          .from('time_entries')
          .select('hours')
          .eq('job_id', data.job_id);

        if (entries) {
          const totalHours = entries.reduce((sum, entry) => sum + Number(entry.hours), 0);
          await supabase
            .from('jobs')
            .update({ time_spent: totalHours })
            .eq('id', data.job_id);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Tempo atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar tempo');
      console.error('Error updating time entry:', error);
    },
  });
}

export function useDeleteTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, jobId }: { id: string; jobId: string }) => {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update job time_spent
      const { data: entries } = await supabase
        .from('time_entries')
        .select('hours')
        .eq('job_id', jobId);

      if (entries) {
        const totalHours = entries.reduce((sum, entry) => sum + Number(entry.hours), 0);
        await supabase
          .from('jobs')
          .update({ time_spent: totalHours })
          .eq('id', jobId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Tempo removido com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover tempo');
      console.error('Error deleting time entry:', error);
    },
  });
}
