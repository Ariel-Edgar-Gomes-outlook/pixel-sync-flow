import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface QuoteTemplate {
  id: string;
  name: string;
  job_type: string;
  items: any[];
  tax: number;
  discount: number;
  notes: string | null;
  currency: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  job_type: string;
  items: any[];
  estimated_time: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  terms_text: string;
  clauses: any;
  cancellation_fee: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Quote Templates
export function useQuoteTemplates() {
  return useQuery({
    queryKey: ['quote-templates'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('quote_templates')
        .select('*')
        .eq('created_by', user.id)
        .order('name');

      if (error) throw error;
      return data as QuoteTemplate[];
    },
  });
}

export function useCreateQuoteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Omit<QuoteTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('quote_templates')
        .insert({ ...template, created_by: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-templates'] });
      toast.success('Template de orçamento criado!');
    },
    onError: () => {
      toast.error('Erro ao criar template');
    },
  });
}

export function useUpdateQuoteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...template }: Partial<QuoteTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('quote_templates')
        .update(template)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-templates'] });
      toast.success('Template atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar template');
    },
  });
}

export function useDeleteQuoteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quote_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['quote-templates'] });
      
      // Snapshot the previous value
      const previousTemplates = queryClient.getQueryData(['quote-templates']);
      
      // Optimistically update
      queryClient.setQueryData(['quote-templates'], (old: any) => 
        old ? old.filter((t: any) => t.id !== id) : []
      );
      
      return { previousTemplates };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousTemplates) {
        queryClient.setQueryData(['quote-templates'], context.previousTemplates);
      }
      toast.error('Erro ao remover template');
    },
    onSuccess: () => {
      toast.success('Template removido!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-templates'] });
    },
  });
}

// Checklist Templates
export function useChecklistTemplates() {
  return useQuery({
    queryKey: ['checklist-templates'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('checklist_templates')
        .select('*')
        .eq('created_by', user.id)
        .order('name');

      if (error) throw error;
      return data as ChecklistTemplate[];
    },
  });
}

export function useCreateChecklistTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Omit<ChecklistTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('checklist_templates')
        .insert({ ...template, created_by: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      toast.success('Template de checklist criado!');
    },
    onError: () => {
      toast.error('Erro ao criar template');
    },
  });
}

export function useUpdateChecklistTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...template }: Partial<ChecklistTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('checklist_templates')
        .update(template)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      toast.success('Template atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar template');
    },
  });
}

export function useDeleteChecklistTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('checklist_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['checklist-templates'] });
      const previousTemplates = queryClient.getQueryData(['checklist-templates']);
      queryClient.setQueryData(['checklist-templates'], (old: any) => 
        old ? old.filter((t: any) => t.id !== id) : []
      );
      return { previousTemplates };
    },
    onError: (err, id, context) => {
      if (context?.previousTemplates) {
        queryClient.setQueryData(['checklist-templates'], context.previousTemplates);
      }
      toast.error('Erro ao remover template');
    },
    onSuccess: () => {
      toast.success('Template removido!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
    },
  });
}

// Contract Templates
export function useContractTemplates() {
  return useQuery({
    queryKey: ['contract-templates'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .eq('created_by', user.id)
        .order('name');

      if (error) throw error;
      return data as ContractTemplate[];
    },
  });
}

export function useCreateContractTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Omit<ContractTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('contract_templates')
        .insert({ ...template, created_by: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
      toast.success('Template de contrato criado!');
    },
    onError: () => {
      toast.error('Erro ao criar template');
    },
  });
}

export function useUpdateContractTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...template }: Partial<ContractTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('contract_templates')
        .update(template)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
      toast.success('Template atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar template');
    },
  });
}

export function useDeleteContractTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contract_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['contract-templates'] });
      const previousTemplates = queryClient.getQueryData(['contract-templates']);
      queryClient.setQueryData(['contract-templates'], (old: any) => 
        old ? old.filter((t: any) => t.id !== id) : []
      );
      return { previousTemplates };
    },
    onError: (err, id, context) => {
      if (context?.previousTemplates) {
        queryClient.setQueryData(['contract-templates'], context.previousTemplates);
      }
      toast.error('Erro ao remover template');
    },
    onSuccess: () => {
      toast.success('Template removido!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
    },
  });
}
