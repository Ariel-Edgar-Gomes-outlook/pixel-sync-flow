import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Job {
  id: string;
  title: string;
  client_id: string | null;
  type: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string | null;
  location: string | null;
  location_map_embed: string | null;
  status: 'scheduled' | 'confirmed' | 'in_production' | 'delivery_pending' | 'completed' | 'cancelled';
  external_assets_links: any;
  external_gallery_link: string | null;
  tags: string[];
  estimated_hours: number | null;
  time_spent: number | null;
  estimated_cost: number | null;
  estimated_revenue: number | null;
  created_at: string;
  updated_at: string;
}

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          clients (
            id,
            name,
            email
          )
        `)
        .eq('created_by', user.id)
        .order('start_datetime', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useJob(id: string | undefined) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          clients (
            id,
            name,
            email,
            phone
          ),
          job_team_members (
            id,
            role,
            team_members (
              id,
              name,
              email
            )
          )
        `)
        .eq('id', id)
        .eq('created_by', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (job: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('jobs')
        .insert({ ...job, created_by: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Job> & { id: string }) => {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
