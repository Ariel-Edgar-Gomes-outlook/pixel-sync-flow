import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Resource {
  id: string;
  name: string;
  type: string;
  status: string;
  location: string | null;
  manual_link: string | null;
  next_maintenance_date: string | null;
  created_at: string;
  updated_at: string;
}

export function useResources() {
  return useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Resource[];
    },
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resource: Partial<Resource>) => {
      const { data, error } = await supabase
        .from('resources')
        .insert({
          name: resource.name!,
          type: resource.type!,
          status: resource.status,
          location: resource.location,
          manual_link: resource.manual_link,
          next_maintenance_date: resource.next_maintenance_date
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Resource> & { id: string }) => {
      const { data, error } = await supabase
        .from('resources')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}