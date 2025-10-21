import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download, Heart, Eye, Lock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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

    await supabase
      .from('gallery_photos')
      .update({ client_selected: !photo.client_selected })
      .eq('id', photoId);

    setPhotos(photos.map(p => 
      p.id === photoId ? { ...p, client_selected: !p.client_selected } : p
    ));
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

      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={photos.find(p => p.id === selectedPhoto)?.file_url}
            alt="Foto ampliada"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
