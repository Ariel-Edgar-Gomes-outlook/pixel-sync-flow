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
    try {
      await updateGallery.mutateAsync({
        id: galleryId,
        sent_to_client_at: new Date().toISOString()
      });
      
      toast({
        title: "Galeria Marcada como Enviada",
        description: "O status de envio foi atualizado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status de envio",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsNotSent = async (galleryId: string) => {
    try {
      await updateGallery.mutateAsync({
        id: galleryId,
        sent_to_client_at: null
      });
      
      toast({
        title: "Status Atualizado",
        description: "A galeria foi marcada como não enviada"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive"
      });
    }
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

  // Conta galerias que foram enviadas ao cliente
  const sentCount = galleries?.filter((g: any) => g.sent_to_client_at).length || 0;
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
          <CardContent className="py-8 text-center">
            <Image className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-2">Nenhuma galeria criada</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crie galerias para compartilhar fotos e links com clientes
            </p>
            <GalleryDialog jobId={jobId} open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Criar Galeria
              </Button>
            </GalleryDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {galleries.map((gallery: any) => {
            const links = Array.isArray(gallery.gallery_links) ? gallery.gallery_links : [];
            const isSent = !!gallery.sent_to_client_at;
            const isShared = gallery.share_token && gallery.status === 'active';
            
            return (
              <Card key={gallery.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-3">
                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <Image className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{gallery.name}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              {links.length} {links.length === 1 ? 'link' : 'links'}
                            </Badge>
                            {isSent && (
                              <Badge className="bg-green-600 text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Enviada
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Links preview - só mostrar em telas maiores */}
                      {links.length > 0 && (
                        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground mt-2">
                          {links.slice(0, 2).map((link: any, index: number) => {
                            const platformType = link.platform || link.type || 'other';
                            return (
                              <span key={index} className="flex items-center gap-1">
                                <span>{getPlatformIcon(platformType)}</span>
                                <span className="truncate max-w-[120px]">{link.name}</span>
                              </span>
                            );
                          })}
                          {links.length > 2 && <span>+{links.length - 2}</span>}
                        </div>
                      )}
                      
                      {/* Timestamps */}
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center">
                          Criada {formatDistanceToNow(new Date(gallery.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                        {isSent && gallery.sent_to_client_at && (
                          <span className="text-green-600">
                            • Enviada {formatDistanceToNow(new Date(gallery.sent_to_client_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 lg:flex-shrink-0">
                      {isSent ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => handleMarkAsNotSent(gallery.id)}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Não Enviada</span>
                          <span className="sm:hidden">Não Enviada</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="default"
                          className="text-xs"
                          onClick={() => handleMarkAsSent(gallery.id)}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Marcar Enviada</span>
                          <span className="sm:hidden">Enviada</span>
                        </Button>
                      )}
                      
                      {isShared && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => copyShareLink(gallery.share_token)}
                        >
                          <LinkIcon className="h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">Link</span>
                        </Button>
                      )}
                      
                      <GalleryDialog jobId={jobId} gallery={gallery} open={false} onOpenChange={setIsDialogOpen}>
                        <Button size="sm" variant="ghost" className="text-xs">
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
