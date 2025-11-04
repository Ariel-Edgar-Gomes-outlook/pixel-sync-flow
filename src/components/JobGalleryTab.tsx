import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGalleries } from "@/hooks/useGalleries";
import { GalleryDialog } from "./GalleryDialog";
import { Plus, ExternalLink, Image, Copy, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
interface JobGalleryTabProps {
  jobId: string;
}
export function JobGalleryTab({
  jobId
}: JobGalleryTabProps) {
  const {
    data: galleries,
    isLoading
  } = useGalleries(jobId);
  const [selectedGalleryId, setSelectedGalleryId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    toast
  } = useToast();
  const selectedGallery = galleries?.find(g => g.id === selectedGalleryId);
  const galleryLinks = selectedGallery?.gallery_links as any[] || [];
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
      'dropbox': '📦',
      'wetransfer': '📤',
      'onedrive': '☁️',
      'mega': '💾',
      'other': '🔗'
    };
    return icons[platform] || icons.other;
  };
  if (isLoading) {
    return <div className="p-4">Carregando galerias...</div>;
  }
  return <div className="space-y-4">
      <div className="flex items-center justify-between mx-[5px]">
        <h3 className="text-lg font-semibold">Galerias de Cliente</h3>
        <GalleryDialog jobId={jobId} open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button className="my-0 mx-0 px-[16px] py-[16px]">
            <Plus className="mr-2 h-4 w-4" />
            Nova Galeria
          </Button>
        </GalleryDialog>
      </div>

      {!galleries || galleries.length === 0 ? <Card className="p-8 text-center">
          <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            Nenhuma galeria criada ainda
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Crie galerias privadas para compartilhar fotos com seus clientes de forma segura e profissional.
          </p>
          <GalleryDialog jobId={jobId} open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button>Criar Primeira Galeria</Button>
          </GalleryDialog>
        </Card> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {galleries.map((gallery: any) => <Card key={gallery.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{gallery.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {Array.isArray(gallery.gallery_links) ? gallery.gallery_links.length : 0} links externos
                  </p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${gallery.status === 'active' ? 'bg-green-100 text-green-800' : gallery.status === 'expired' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                  {gallery.status === 'active' ? 'Ativa' : gallery.status === 'expired' ? 'Expirada' : 'Fechada'}
                </div>
              </div>

              {gallery.expiration_date && <p className="text-xs text-muted-foreground mb-3">
                  Expira em: {format(new Date(gallery.expiration_date), 'dd/MM/yyyy')}
                </p>}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedGalleryId(gallery.id)}>
                  Ver Fotos
                </Button>
                
                <Button variant="outline" size="sm" onClick={() => copyShareLink(gallery.share_token)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>
                
                <Button variant="outline" size="sm" asChild>
                  <a href={`${window.location.origin}/gallery/${gallery.share_token}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </Card>)}
        </div>}

      {selectedGallery && <Card className="p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold">{selectedGallery.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {galleryLinks.length} links de galerias externas
              </p>
            </div>
            <div className="flex gap-2">
              <GalleryDialog jobId={jobId} gallery={selectedGallery as any} open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Editar Links
                </Button>
              </GalleryDialog>
              
              <Button variant="outline" size="sm" onClick={() => setSelectedGalleryId(null)}>
                Fechar
              </Button>
            </div>
          </div>

          {selectedGallery.access_instructions && <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{selectedGallery.access_instructions}</p>
            </div>}

          {galleryLinks.length === 0 ? <div className="text-center py-8 text-muted-foreground">
              <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">Nenhum link adicionado ainda</p>
              <p className="text-xs mb-4">Adicione links de plataformas como Google Drive, Dropbox, WeTransfer, etc.</p>
              <GalleryDialog jobId={jobId} gallery={selectedGallery as any} open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Links
                </Button>
              </GalleryDialog>
            </div> : <div className="space-y-3">
              {galleryLinks.map((link: any, index: number) => <Card key={index} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getPlatformIcon(link.platform)}</span>
                        <div>
                          <h5 className="font-semibold">{link.name}</h5>
                          <p className="text-xs text-muted-foreground">{link.platform}</p>
                        </div>
                      </div>
                      {link.password && <p className="text-sm text-muted-foreground mb-1">
                          🔒 Senha: <code className="bg-muted px-2 py-1 rounded">{link.password}</code>
                        </p>}
                      {link.access_instructions && <p className="text-sm text-muted-foreground">{link.access_instructions}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                navigator.clipboard.writeText(link.url);
                toast({
                  title: "Link Copiado!",
                  description: "O link foi copiado para a área de transferência"
                });
              }}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>)}
            </div>}
        </Card>}
    </div>;
}