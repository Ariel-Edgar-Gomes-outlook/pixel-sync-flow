import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGalleries, useGalleryPhotos, useUploadGalleryPhoto, useDeleteGalleryPhoto } from "@/hooks/useGalleries";
import { GalleryDialog } from "./GalleryDialog";
import { Plus, ExternalLink, Image, Trash2, Upload, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface JobGalleryTabProps {
  jobId: string;
}

export function JobGalleryTab({ jobId }: JobGalleryTabProps) {
  const { data: galleries, isLoading } = useGalleries(jobId);
  const [selectedGalleryId, setSelectedGalleryId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  
  const { data: photos } = useGalleryPhotos(selectedGalleryId || "");
  const uploadPhoto = useUploadGalleryPhoto();
  const deletePhoto = useDeleteGalleryPhoto();
  const { toast } = useToast();

  const selectedGallery = galleries?.find(g => g.id === selectedGalleryId);

  const copyShareLink = (token: string) => {
    const url = `${window.location.origin}/gallery/${token}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copiado!",
      description: "O link da galeria foi copiado para a área de transferência",
    });
  };

  if (isLoading) {
    return <div className="p-4">Carregando galerias...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Galerias de Cliente</h3>
        <GalleryDialog jobId={jobId}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Galeria
          </Button>
        </GalleryDialog>
      </div>

      {!galleries || galleries.length === 0 ? (
        <Card className="p-8 text-center">
          <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            Nenhuma galeria criada ainda
          </p>
          <GalleryDialog jobId={jobId}>
            <Button>Criar Primeira Galeria</Button>
          </GalleryDialog>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {galleries.map((gallery: any) => (
            <Card key={gallery.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{gallery.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {gallery.gallery_photos?.[0]?.count || 0} fotos
                  </p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  gallery.status === 'active' ? 'bg-green-100 text-green-800' :
                  gallery.status === 'expired' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {gallery.status === 'active' ? 'Ativa' :
                   gallery.status === 'expired' ? 'Expirada' : 'Fechada'}
                </div>
              </div>

              {gallery.expiration_date && (
                <p className="text-xs text-muted-foreground mb-3">
                  Expira em: {format(new Date(gallery.expiration_date), 'dd/MM/yyyy')}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedGalleryId(gallery.id)}
                >
                  Ver Fotos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyShareLink(gallery.share_token)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a href={`/gallery/${gallery.share_token}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedGallery && (
        <Card className="p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold">{selectedGallery.name}</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUpload(!showUpload)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Fotos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedGalleryId(null)}
              >
                Fechar
              </Button>
            </div>
          </div>

          {showUpload && (
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  for (const file of files) {
                    await uploadPhoto.mutateAsync({ galleryId: selectedGalleryId!, file });
                  }
                  toast({ title: "Fotos enviadas!" });
                  setShowUpload(false);
                }}
                className="w-full"
              />
            </div>
          )}

          {!photos || photos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma foto nesta galeria</p>
              <Button
                variant="link"
                onClick={() => setShowUpload(true)}
              >
                Fazer upload de fotos
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.file_url}
                    alt={photo.file_name}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deletePhoto.mutate(photo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {photo.client_selected && (
                    <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
                      <span className="text-white text-xs">❤️</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
