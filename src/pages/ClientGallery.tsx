import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download, Heart, Eye, Lock, Package } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import JSZip from "jszip";

interface GalleryData {
  id: string;
  name: string;
  password_protected: boolean;
  password_hash: string | null;
  allow_selection: boolean;
  status: string;
  download_limit: number | null;
}

interface PhotoData {
  id: string;
  file_url: string;
  file_name: string;
  client_selected: boolean;
}

export default function ClientGallery() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [gallery, setGallery] = useState<GalleryData | null>(null);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    loadGallery();
  }, [token]);

  const loadGallery = async () => {
    try {
      const { data: galleryData, error } = await supabase
        .from('client_galleries')
        .select('*')
        .eq('share_token', token)
        .single();

      if (error) throw error;

      if (galleryData.status !== 'active') {
        toast({
          variant: "destructive",
          title: "Galeria Indisponível",
          description: "Esta galeria expirou ou foi fechada",
        });
        return;
      }

      setGallery(galleryData);

      if (!galleryData.password_protected) {
        setAuthenticated(true);
        await loadPhotos(galleryData.id);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Galeria não encontrada",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async (galleryId: string) => {
    const { data, error } = await supabase
      .from('gallery_photos')
      .select('*')
      .eq('gallery_id', galleryId)
      .order('display_order');

    if (error) {
      console.error(error);
      return;
    }

    setPhotos(data || []);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gallery) return;

    // Simples verificação (em produção, usar hash)
    if (password === gallery.password_hash) {
      setAuthenticated(true);
      await loadPhotos(gallery.id);
    } else {
      toast({
        variant: "destructive",
        title: "Senha Incorreta",
        description: "Por favor, tente novamente",
      });
    }
  };

  const toggleSelection = async (photoId: string) => {
    if (!gallery?.allow_selection) return;

    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

    const newSelectedState = !photo.client_selected;

    await supabase
      .from('gallery_photos')
      .update({ client_selected: newSelectedState })
      .eq('id', photoId);

    setPhotos(photos.map(p => 
      p.id === photoId ? { ...p, client_selected: newSelectedState } : p
    ));

    // Notificar fotógrafo quando cliente seleciona
    if (newSelectedState) {
      await supabase.from('notifications').insert({
        recipient_id: (await supabase.from('client_galleries').select('job_id, jobs!inner(created_by)').eq('id', gallery.id).single()).data?.jobs?.created_by,
        type: 'gallery_selection',
        payload: {
          gallery_id: gallery.id,
          gallery_name: gallery.name,
          photo_count: photos.filter(p => p.client_selected).length + 1,
        }
      });
    }
  };

  const downloadPhoto = async (photo: PhotoData) => {
    try {
      const response = await fetch(photo.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = photo.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      await supabase
        .from('gallery_photos')
        .update({ client_downloaded_at: new Date().toISOString() })
        .eq('id', photo.id);

      toast({
        title: "Download Iniciado",
        description: photo.file_name,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no Download",
        description: "Não foi possível baixar a foto",
      });
    }
  };

  const downloadSelectedPhotos = async () => {
    const selectedPhotos = photos.filter(p => p.client_selected);
    
    if (selectedPhotos.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhuma foto selecionada",
        description: "Selecione pelo menos uma foto para baixar",
      });
      return;
    }

    toast({
      title: "Preparando download...",
      description: `Baixando ${selectedPhotos.length} fotos`,
    });

    try {
      const zip = new JSZip();
      
      // Baixar todas as fotos e adicionar ao ZIP
      for (const photo of selectedPhotos) {
        const response = await fetch(photo.file_url);
        const blob = await response.blob();
        zip.file(photo.file_name, blob);
      }

      // Gerar e baixar o ZIP
      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${gallery?.name || 'galeria'}-selecionadas.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Atualizar timestamps de download
      await Promise.all(
        selectedPhotos.map(photo =>
          supabase
            .from('gallery_photos')
            .update({ client_downloaded_at: new Date().toISOString() })
            .eq('id', photo.id)
        )
      );

      toast({
        title: "Download Concluído!",
        description: `${selectedPhotos.length} fotos baixadas com sucesso`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no Download",
        description: "Não foi possível baixar as fotos selecionadas",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando galeria...</p>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <h1 className="text-2xl font-bold mb-4">Galeria Não Encontrada</h1>
          <p>Esta galeria não existe ou foi removida.</p>
        </Card>
      </div>
    );
  }

  if (gallery.password_protected && !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <Lock className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">{gallery.name}</h1>
          <p className="text-center text-muted-foreground mb-6">
            Esta galeria está protegida por senha
          </p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Digite a senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Acessar Galeria
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{gallery.name}</h1>
              <p className="text-muted-foreground">
                {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
                {gallery.allow_selection && (
                  <span className="ml-4">
                    {photos.filter(p => p.client_selected).length} selecionadas
                  </span>
                )}
              </p>
            </div>
            {gallery.allow_selection && photos.filter(p => p.client_selected).length > 0 && (
              <Button onClick={downloadSelectedPhotos} className="gap-2">
                <Package className="h-4 w-4" />
                Baixar Selecionadas ({photos.filter(p => p.client_selected).length})
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {photos.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nenhuma foto disponível ainda</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden group relative">
                <img
                  src={photo.file_url}
                  alt={photo.file_name}
                  className="w-full aspect-square object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedPhoto(photo.id)}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedPhoto(photo.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => downloadPhoto(photo)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {gallery.allow_selection && (
                    <Button
                      size="sm"
                      variant={photo.client_selected ? "default" : "secondary"}
                      onClick={() => toggleSelection(photo.id)}
                    >
                      <Heart className={`h-4 w-4 ${photo.client_selected ? 'fill-current' : ''}`} />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {selectedPhoto && (() => {
        const currentIndex = photos.findIndex(p => p.id === selectedPhoto);
        const currentPhoto = photos[currentIndex];
        const hasPrev = currentIndex > 0;
        const hasNext = currentIndex < photos.length - 1;

        const goToPrev = () => hasPrev && setSelectedPhoto(photos[currentIndex - 1].id);
        const goToNext = () => hasNext && setSelectedPhoto(photos[currentIndex + 1].id);

        return (
          <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 text-white">
              <span className="text-sm">
                {currentIndex + 1} / {photos.length}
              </span>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-white hover:text-gray-300 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Main image area */}
            <div className="flex-1 flex items-center justify-center relative p-4">
              {hasPrev && (
                <button
                  onClick={goToPrev}
                  className="absolute left-4 text-white hover:text-gray-300 text-4xl font-bold z-10"
                >
                  ‹
                </button>
              )}
              
              <img
                src={currentPhoto?.file_url}
                alt="Foto ampliada"
                className="max-w-full max-h-full object-contain"
              />

              {hasNext && (
                <button
                  onClick={goToNext}
                  className="absolute right-4 text-white hover:text-gray-300 text-4xl font-bold z-10"
                >
                  ›
                </button>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-center gap-4 p-4">
              <Button
                variant="secondary"
                onClick={() => downloadPhoto(currentPhoto)}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
              {gallery?.allow_selection && (
                <Button
                  variant={currentPhoto.client_selected ? "default" : "secondary"}
                  onClick={() => toggleSelection(currentPhoto.id)}
                >
                  <Heart className={`h-4 w-4 mr-2 ${currentPhoto.client_selected ? 'fill-current' : ''}`} />
                  {currentPhoto.client_selected ? 'Selecionada' : 'Selecionar'}
                </Button>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
