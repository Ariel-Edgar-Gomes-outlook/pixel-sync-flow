import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  type: string;
  created_at: string;
}

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team_members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('type', 'client')
        .order('name');
      
      if (error) throw error;
      return data as TeamMember[];
    },
  });
}

export function useCreateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (member: {
      name: string;
      email: string;
      phone?: string;
      type: string;
    }) => {
      // Create a dummy user_id for team members (they don't need auth)
      const dummyUserId = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: dummyUserId,
          name: member.name,
          email: member.email,
          phone: member.phone || null,
          type: member.type,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team_members'] });
      queryClient.invalidateQueries({ queryKey: ['team_profiles'] });
    },
  });
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      ...updates 
    }: { 
      id: string;
      name?: string;
      email?: string;
      phone?: string;
      type?: string;
    }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team_members'] });
      queryClient.invalidateQueries({ queryKey: ['team_profiles'] });
    },
  });
}

export function useDeleteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team_members'] });
      queryClient.invalidateQueries({ queryKey: ['team_profiles'] });
    },
  });
}
