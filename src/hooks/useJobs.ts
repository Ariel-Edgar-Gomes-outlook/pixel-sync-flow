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
        .order('start_datetime', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: async () => {
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
        .single();

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (job: any) => {
      const { data, error} = await supabase
        .from('jobs')
        .insert([job])
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
