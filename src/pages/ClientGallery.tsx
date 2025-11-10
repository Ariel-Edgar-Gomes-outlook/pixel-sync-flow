import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";
import { GalleryLinksDisplay } from "@/components/GalleryLinksDisplay";

interface GalleryData {
  id: string;
  name: string;
  password_protected: boolean;
  password_hash: string | null;
  status: string;
  gallery_links: any[];
  access_instructions: string | null;
}

export default function ClientGallery() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [gallery, setGallery] = useState<GalleryData | null>(null);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

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

      setGallery({
        ...galleryData,
        gallery_links: Array.isArray(galleryData.gallery_links) ? galleryData.gallery_links : []
      } as GalleryData);

      if (!galleryData.password_protected) {
        setAuthenticated(true);
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gallery) return;

    // Verificação simples (em produção, usar hash adequado)
    if (password === gallery.password_hash) {
      setAuthenticated(true);
    } else {
      toast({
        variant: "destructive",
        title: "Senha Incorreta",
        description: "Por favor, tente novamente",
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

  // Filtrar links baseado nos parâmetros da URL
  const getFilteredLinks = () => {
    const linksParam = searchParams.get('links');
    if (!linksParam || !gallery) {
      return gallery?.gallery_links || [];
    }

    try {
      const selectedIndices = linksParam.split(',').map(Number);
      return gallery.gallery_links.filter((_, index) => 
        selectedIndices.includes(index)
      );
    } catch {
      return gallery?.gallery_links || [];
    }
  };

  const filteredLinks = getFilteredLinks();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">{gallery.name}</h1>
          {gallery.access_instructions && (
            <p className="text-muted-foreground">{gallery.access_instructions}</p>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <GalleryLinksDisplay links={filteredLinks} />
      </main>
    </div>
  );
}
