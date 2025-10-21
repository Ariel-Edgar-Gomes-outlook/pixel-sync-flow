import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Gallery {
  id: string;
  job_id: string;
  name: string;
  password_protected: boolean;
  password_hash: string | null;
  expiration_date: string | null;
  download_limit: number | null;
  allow_selection: boolean;
  status: 'active' | 'expired' | 'closed';
  share_token: string;
  created_at: string;
  updated_at: string;
}

export interface GalleryPhoto {
  id: string;
  gallery_id: string;
  file_url: string;
  thumbnail_url: string | null;
  file_name: string;
  file_size: number | null;
  display_order: number;
  client_selected: boolean;
  client_downloaded_at: string | null;
  created_at: string;
}

export function useGalleries(jobId?: string) {
  return useQuery({
    queryKey: ['galleries', jobId],
    queryFn: async () => {
      let query = supabase
        .from('client_galleries')
        .select('*, gallery_photos(count)')
        .order('created_at', { ascending: false });

      if (jobId) {
        query = query.eq('job_id', jobId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useGalleryPhotos(galleryId: string) {
  return useQuery({
    queryKey: ['gallery-photos', galleryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .eq('gallery_id', galleryId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!galleryId,
  });
}

export function useCreateGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gallery: any) => {
      const { data, error } = await supabase
        .from('client_galleries')
        .insert([gallery])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
    },
  });
}

export function useUpdateGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Gallery> & { id: string }) => {
      const { data, error } = await supabase
        .from('client_galleries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
    },
  });
}

export function useUploadGalleryPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ galleryId, file }: { galleryId: string; file: File }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${galleryId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('deliverables')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('deliverables')
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from('gallery_photos')
        .insert([{
          gallery_id: galleryId,
          file_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-photos'] });
    },
  });
}

export function useDeleteGalleryPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await supabase
        .from('gallery_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-photos'] });
    },
  });
}
