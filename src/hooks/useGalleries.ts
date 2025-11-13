import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GalleryLink {
  name: string;
  url: string;
  type: 'gdrive' | 'dropbox' | 'wetransfer' | 'onedrive' | 'pixieset' | 'other';
  password?: string;
  instructions?: string;
}

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
  gallery_links: GalleryLink[];
  access_instructions: string | null;
  sent_to_client_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GalleryPhoto {
  id: string;
  gallery_id: string;
  file_url: string | null;
  thumbnail_url: string | null;
  file_name: string;
  file_size: number | null;
  display_order: number;
  client_selected: boolean;
  client_downloaded_at: string | null;
  item_id: string | null;
  external_url: string | null;
  created_at: string;
}

export function useGalleries(jobId?: string) {
  return useQuery({
    queryKey: ['galleries', jobId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let jobQuery = supabase
        .from('jobs')
        .select('id')
        .eq('created_by', user.id);

      if (jobId) {
        jobQuery = jobQuery.eq('id', jobId);
      }

      const { data: userJobs, error: jobsError } = await jobQuery;
      if (jobsError) throw jobsError;

      const userJobIds = userJobs?.map(j => j.id) || [];
      
      if (userJobIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('client_galleries')
        .select('*, gallery_photos(count)')
        .in('job_id', userJobIds)
        .order('created_at', { ascending: false });

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
        .insert([{
          ...gallery,
          gallery_links: JSON.parse(JSON.stringify(gallery.gallery_links || []))
        }])
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
      const updateData: any = { ...updates };
      if (updates.gallery_links) {
        updateData.gallery_links = JSON.parse(JSON.stringify(updates.gallery_links));
      }
      
      const { data, error } = await supabase
        .from('client_galleries')
        .update(updateData)
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
