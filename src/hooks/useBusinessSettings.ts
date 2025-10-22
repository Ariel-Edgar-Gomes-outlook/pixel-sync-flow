import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BusinessSettings {
  id: string;
  user_id: string;
  business_name: string;
  trade_name: string | null;
  nif: string | null;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  postal_code: string | null;
  bank_name: string | null;
  iban: string | null;
  account_holder: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  signature_url: string | null;
  legal_representative_name: string | null;
  legal_representative_title: string | null;
  invoice_prefix: string | null;
  next_invoice_number: number | null;
  proforma_prefix: string | null;
  next_proforma_number: number | null;
  terms_footer: string | null;
  payment_terms: string | null;
  created_at: string;
  updated_at: string;
}

type BusinessSettingsInsert = Omit<BusinessSettings, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export function useBusinessSettings(userId: string | undefined) {
  return useQuery({
    queryKey: ['business_settings', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useCreateBusinessSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<BusinessSettingsInsert> & { user_id: string; business_name: string; email: string }) => {
      const { data, error } = await supabase
        .from('business_settings')
        .insert([settings as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['business_settings', data.user_id] });
      toast.success('Configurações criadas com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar configurações');
    },
  });
}

export function useUpdateBusinessSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, ...updates }: Partial<BusinessSettings> & { userId: string }) => {
      const { data, error } = await supabase
        .from('business_settings')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['business_settings', data.user_id] });
      toast.success('Configurações atualizadas com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar configurações');
    },
  });
}

export function useUploadBusinessFile() {
  return useMutation({
    mutationFn: async ({ 
      file, 
      userId, 
      type 
    }: { 
      file: File; 
      userId: string; 
      type: 'logo' | 'signature' 
    }) => {
      const bucket = type === 'logo' ? 'business-logos' : 'business-signatures';
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return publicUrl;
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao fazer upload do ficheiro');
    },
  });
}
