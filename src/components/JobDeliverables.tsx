import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGalleries, useUpdateGallery } from '@/hooks/useGalleries';
import { GalleryDialog } from './GalleryDialog';
import { ShareGalleryDialog } from './ShareGalleryDialog';
import { 
  ExternalLink,
  Send,
  Plus,
  Link as LinkIcon,
  Image,
  Copy,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface JobDeliverablesProps {
  jobId: string;
}

export function JobDeliverables({ jobId }: JobDeliverablesProps) {
  const { data: galleries, isLoading } = useGalleries(jobId);
  const updateGallery = useUpdateGallery();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGalleryId, setSelectedGalleryId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleMarkAsSent = async (galleryId: string) => {
    const gallery = galleries?.find(g => g.id === galleryId);
    if (!gallery) return;
    
    await updateGallery.mutateAsync({
      id: galleryId,
      status: 'active' as any,
      gallery_links: (gallery.gallery_links || []) as any
    });
    
    toast({
      title: "Galeria marcada como enviada",
      description: "O cliente foi notificado sobre a disponibilidade.",
    });
  };

  const copyShareLink = (token: string) => {
    const url = `${window.location.origin}/gallery/${token}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copiado!",
      description: "O link da galeria foi copiado para a área de transferência"
    });
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      'google_drive': '📁',
      'gdrive': '📁',
      'dropbox': '📦',
      'wetransfer': '📤',
      'onedrive': '☁️',
      'mega': '💾',
      'other': '🔗'
    };
    return icons[platform] || icons.other;
  };

  if (isLoading) {
    return <div>Carregando galerias...</div>;
  }

  // Conta galerias que foram compartilhadas (tem share_token e status active)
  const sentCount = galleries?.filter(g => g.share_token && g.status === 'active').length || 0;
  const pendingCount = (galleries?.length || 0) - sentCount;
  const totalLinks = galleries?.reduce((acc, g) => {
    const links = Array.isArray(g.gallery_links) ? g.gallery_links.length : 0;
    return acc + links;
  }, 0) || 0;

  const selectedGallery = galleries?.find(g => g.id === selectedGalleryId);
  const galleryLinks = selectedGallery?.gallery_links as any[] || [];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{galleries?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Total de Galerias</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{sentCount}</div>
            <p className="text-sm text-muted-foreground">Compartilhadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{totalLinks}</div>
            <p className="text-sm text-muted-foreground">Links Externos</p>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Galerias Criadas</h3>
          <p className="text-sm text-muted-foreground">
            Visualize e compartilhe as galerias de fotos com o cliente
          </p>
        </div>
        <GalleryDialog jobId={jobId} open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Galeria
          </Button>
        </GalleryDialog>
      </div>

      {/* Galleries List */}
      {!galleries || galleries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma galeria criada</h3>
            <p className="text-muted-foreground mb-4">
              Crie galerias para compartilhar fotos e links com seus clientes de forma organizada
            </p>
            <GalleryDialog jobId={jobId} open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Galeria
              </Button>
            </GalleryDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {galleries.map((gallery: any) => {
            const links = Array.isArray(gallery.gallery_links) ? gallery.gallery_links : [];
            const isShared = gallery.share_token && gallery.status === 'active';
            
            return (
              <Card key={gallery.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-muted rounded-lg">
                        <Image className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{gallery.name}</h3>
                          <Badge variant={isShared ? "default" : "secondary"}>
                            {links.length} {links.length === 1 ? 'link' : 'links'}
                          </Badge>
                          {isShared && (
                            <Badge className="bg-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Compartilhada
                            </Badge>
                          )}
                        </div>
                        
                        {gallery.access_instructions && (
                          <p className="text-sm text-muted-foreground">
                            📝 {gallery.access_instructions}
                          </p>
                        )}
                        
                        {/* Links externos da galeria */}
                        {links.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {links.slice(0, 3).map((link: any, index: number) => {
                              const platformType = link.platform || link.type || 'other';
                              return (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <span className="text-lg">{getPlatformIcon(platformType)}</span>
                                  <span className="text-muted-foreground">{link.name}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => {
                                      navigator.clipboard.writeText(link.url);
                                      toast({
                                        title: "Link Copiado!",
                                        description: "O link foi copiado"
                                      });
                                    }}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    asChild
                                  >
                                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </Button>
                                </div>
                              );
                            })}
                            {links.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                + {links.length - 3} mais {links.length - 3 === 1 ? 'link' : 'links'}
                              </p>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            Criada {formatDistanceToNow(new Date(gallery.created_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!isShared ? (
                        <ShareGalleryDialog gallery={gallery}>
                          <Button size="sm" variant="outline">
                            <Share2 className="h-4 w-4 mr-2" />
                            Compartilhar
                          </Button>
                        </ShareGalleryDialog>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyShareLink(gallery.share_token)}
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Copiar Link
                        </Button>
                      )}
                      
                      <GalleryDialog jobId={jobId} gallery={gallery} open={false} onOpenChange={setIsDialogOpen}>
                        <Button size="sm" variant="ghost">
                          Editar
                        </Button>
                      </GalleryDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
