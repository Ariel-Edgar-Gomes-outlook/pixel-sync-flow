import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUpdateJob } from "@/hooks/useJobs";
import { toast } from "sonner";
import { Plus, X, Link as LinkIcon, Image, ExternalLink } from "lucide-react";

interface JobDeliverablesProps {
  jobId: string;
  externalAssetsLinks: string[];
  externalGalleryLink: string | null;
}

export function JobDeliverables({ jobId, externalAssetsLinks, externalGalleryLink }: JobDeliverablesProps) {
  const [assetLinks, setAssetLinks] = useState<string[]>(externalAssetsLinks || []);
  const [newAssetLink, setNewAssetLink] = useState("");
  const [galleryLink, setGalleryLink] = useState(externalGalleryLink || "");
  
  const updateJob = useUpdateJob();

  const addAssetLink = () => {
    if (!newAssetLink.trim()) {
      toast.error("Por favor, insira um link válido");
      return;
    }
    
    const updatedLinks = [...assetLinks, newAssetLink.trim()];
    setAssetLinks(updatedLinks);
    setNewAssetLink("");
  };

  const removeAssetLink = (index: number) => {
    const updatedLinks = assetLinks.filter((_, i) => i !== index);
    setAssetLinks(updatedLinks);
  };

  const handleSave = async () => {
    try {
      await updateJob.mutateAsync({
        id: jobId,
        external_assets_links: assetLinks,
        external_gallery_link: galleryLink || null,
      });
      toast.success("Entregáveis atualizados com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar entregáveis");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Galeria Principal */}
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <Image className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-base font-semibold text-foreground">Galeria Principal</h3>
            <p className="text-xs text-muted-foreground">Link para a galeria completa do projeto</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gallery_link" className="text-sm font-medium">
            Link da Galeria (Google Drive, Dropbox, etc.)
          </Label>
          <div className="flex gap-2">
            <Input
              id="gallery_link"
              value={galleryLink}
              onChange={(e) => setGalleryLink(e.target.value)}
              placeholder="https://drive.google.com/... ou https://www.dropbox.com/..."
              className="bg-background"
            />
            {galleryLink && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => window.open(galleryLink, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            📸 Link principal onde o cliente pode acessar todas as fotos
          </p>
        </div>
      </Card>

      {/* Links de Assets Adicionais */}
      <Card className="p-4 sm:p-6 bg-muted/50">
        <div className="flex items-center gap-3 mb-4">
          <LinkIcon className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-base font-semibold text-foreground">Links de Assets Adicionais</h3>
            <p className="text-xs text-muted-foreground">Vídeos, arquivos RAW, contratos assinados, etc.</p>
          </div>
        </div>

        {/* Adicionar Novo Link */}
        <div className="space-y-3 mb-4">
          <Label htmlFor="new_asset" className="text-sm font-medium">
            Adicionar Novo Link
          </Label>
          <div className="flex gap-2">
            <Input
              id="new_asset"
              value={newAssetLink}
              onChange={(e) => setNewAssetLink(e.target.value)}
              placeholder="https://..."
              className="bg-background"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addAssetLink();
                }
              }}
            />
            <Button type="button" onClick={addAssetLink} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            🔗 Links para vídeos, arquivos RAW, contratos, ou qualquer outro material
          </p>
        </div>

        {/* Lista de Links */}
        {assetLinks.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum link adicionado ainda</p>
            <p className="text-xs text-muted-foreground mt-1">Adicione links para organizar todos os entregáveis</p>
          </div>
        ) : (
          <div className="space-y-2">
            {assetLinks.map((link, index) => (
              <Card key={index} className="p-3 flex items-center justify-between bg-background hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <LinkIcon className="h-4 w-4 text-primary shrink-0" />
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline truncate"
                  >
                    {link}
                  </a>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(link, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAssetLink(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Resumo */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Total de Links</p>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className="bg-background">
                <Image className="h-3 w-3 mr-1" />
                {galleryLink ? '1 Galeria' : '0 Galeria'}
              </Badge>
              <Badge variant="outline" className="bg-background">
                <LinkIcon className="h-3 w-3 mr-1" />
                {assetLinks.length} Assets
              </Badge>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={updateJob.isPending}
            size="lg"
          >
            {updateJob.isPending ? "Salvando..." : "Salvar Entregáveis"}
          </Button>
        </div>
      </Card>
    </div>
  );
}