import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, File, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileUploadProps {
  bucket: 'receipts' | 'contracts' | 'deliverables' | 'pdfs';
  path?: string;
  accept?: string;
  maxSize?: number; // in MB
  onUploadComplete: (url: string, fileName: string, fileSize: number) => void;
  onRemove?: () => void;
  currentFile?: string | null;
  label?: string;
}

export function FileUpload({
  bucket,
  path = '',
  accept = '*',
  maxSize = 10,
  onUploadComplete,
  onRemove,
  currentFile,
  label = 'Upload File',
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentFile || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > maxSize) {
      toast.error(`Arquivo muito grande. Máximo: ${maxSize}MB`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${path}${Date.now()}.${fileExt}`;

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setProgress(100);
      
      // Show preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(urlData.publicUrl);
      }

      onUploadComplete(urlData.publicUrl, file.name, file.size);
      toast.success('Arquivo enviado com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar arquivo');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemove) {
      onRemove();
    }
  };

  const isImage = preview && (preview.startsWith('data:image') || preview.includes('/deliverables/') || preview.includes('/receipts/'));

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {preview ? (
        <div className="relative">
          {isImage ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 p-4 border rounded-lg">
              <File className="h-8 w-8 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Arquivo enviado</p>
                <a
                  href={preview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Ver arquivo
                </a>
              </div>
            </div>
          )}
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-32 border-dashed"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <>
                <Upload className="h-8 w-8 animate-pulse" />
                <div className="w-full">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm mt-2">Enviando...</p>
                </div>
              </>
            ) : (
              <>
                {accept.includes('image') ? (
                  <ImageIcon className="h-8 w-8" />
                ) : (
                  <Upload className="h-8 w-8" />
                )}
                <div className="text-center">
                  <p className="font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">
                    Máximo {maxSize}MB
                  </p>
                </div>
              </>
            )}
          </div>
        </Button>
      )}
    </div>
  );
}
