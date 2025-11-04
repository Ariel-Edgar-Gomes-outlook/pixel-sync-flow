import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateGallery, useUpdateGallery, type Gallery, type GalleryLink } from "@/hooks/useGalleries";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { GalleryLinksManager } from "./GalleryLinksManager";

interface GalleryDialogProps {
  jobId: string;
  gallery?: Gallery;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GalleryDialog({ jobId, gallery, children, open, onOpenChange }: GalleryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(gallery?.name || "");
  const [galleryLinks, setGalleryLinks] = useState<GalleryLink[]>(gallery?.gallery_links || []);
  const [accessInstructions, setAccessInstructions] = useState(gallery?.access_instructions || "");
  const [passwordProtected, setPasswordProtected] = useState(gallery?.password_protected || false);
  const [password, setPassword] = useState("");
  const [allowSelection, setAllowSelection] = useState(gallery?.allow_selection ?? true);
  const [downloadLimit, setDownloadLimit] = useState<number | null>(gallery?.download_limit || null);
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(
    gallery?.expiration_date ? new Date(gallery.expiration_date) : undefined
  );
  const [status, setStatus] = useState<"active" | "closed" | "expired">(gallery?.status || "active");

  const createGallery = useCreateGallery();
  const updateGallery = useUpdateGallery();
  const { toast } = useToast();

  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O nome da galeria é obrigatório",
      });
      return;
    }

    if (passwordProtected && !password && !gallery) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, defina uma senha para proteger a galeria",
      });
      return;
    }
    
    try {
      const galleryData = {
        job_id: jobId,
        name: name.trim(),
        gallery_links: galleryLinks as any,
        access_instructions: accessInstructions.trim() || null,
        password_protected: passwordProtected,
        password_hash: password ? password : null,
        allow_selection: allowSelection,
        download_limit: downloadLimit,
        expiration_date: expirationDate?.toISOString() || null,
        status: status as any,
      };

      if (gallery) {
        await updateGallery.mutateAsync({ id: gallery.id, ...galleryData });
        toast({
          title: "✅ Sucesso",
          description: "Galeria atualizada com sucesso",
        });
      } else {
        const newGallery = await createGallery.mutateAsync(galleryData);
        toast({
          title: "✅ Galeria Criada",
          description: "Link de compartilhamento copiado!",
        });
        // Copiar link automaticamente
        navigator.clipboard.writeText(`${window.location.origin}/gallery/${newGallery.share_token}`);
      }
      
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao salvar galeria",
      });
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Galeria
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{gallery ? "Editar Galeria" : "Nova Galeria de Cliente"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome da Galeria */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">Nome da Galeria</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Casamento João e Maria"
              required
              className="transition-all"
            />
          </div>

          {/* Links Externos */}
          <div className="space-y-3">
            <GalleryLinksManager links={galleryLinks} onChange={setGalleryLinks} />
          </div>

          {/* Instruções de Acesso */}
          <div className="space-y-2">
            <Label htmlFor="access-instructions" className="text-sm font-semibold">Instruções Gerais de Acesso</Label>
            <Textarea
              id="access-instructions"
              value={accessInstructions}
              onChange={(e) => setAccessInstructions(e.target.value)}
              placeholder="Instruções gerais para o cliente acessar as galerias..."
              rows={3}
              className="transition-all resize-none"
            />
          </div>

          {/* Configurações */}
          <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/50">
            <h4 className="text-sm font-semibold mb-3">Configurações de Segurança</h4>
            
            {/* Proteger com Senha */}
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="password_protected" className="text-sm font-medium cursor-pointer">
                  Proteger com Senha
                </Label>
                <p className="text-xs text-muted-foreground">Requer senha para acessar a galeria</p>
              </div>
              <Switch
                id="password_protected"
                checked={passwordProtected}
                onCheckedChange={setPasswordProtected}
              />
            </div>

            {passwordProtected && (
              <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                <Label htmlFor="password" className="text-sm">Senha de Acesso</Label>
                <Input
                  id="password"
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                  required={passwordProtected && !gallery}
                />
                <p className="text-xs text-muted-foreground">Esta senha será compartilhada com o cliente</p>
              </div>
            )}

            {/* Permitir Seleção */}
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="allow_selection" className="text-sm font-medium cursor-pointer">
                  Permitir Cliente Selecionar Favoritas
                </Label>
                <p className="text-xs text-muted-foreground">Cliente pode marcar fotos favoritas</p>
              </div>
              <Switch
                id="allow_selection"
                checked={allowSelection}
                onCheckedChange={setAllowSelection}
              />
            </div>
          </div>

          {/* Limites */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="download_limit" className="text-sm font-semibold">Limite de Downloads</Label>
              <Input
                id="download_limit"
                type="number"
                min="0"
                value={downloadLimit || ""}
                onChange={(e) => setDownloadLimit(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Ilimitado"
              />
              <p className="text-xs text-muted-foreground">Deixe vazio para ilimitado</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Data de Expiração</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expirationDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expirationDate ? format(expirationDate, "dd/MM/yyyy") : "Sem expiração"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expirationDate}
                    onSelect={setExpirationDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
              {expirationDate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpirationDate(undefined)}
                  className="w-full text-xs"
                >
                  Remover expiração
                </Button>
              )}
            </div>
          </div>

          {/* Status (apenas ao editar) */}
          {gallery && (
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-semibold">Status da Galeria</Label>
              <select
                id="status"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-primary/20"
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "closed" | "expired")}
              >
                <option value="active">✅ Ativa</option>
                <option value="expired">⏰ Expirada</option>
                <option value="closed">🔒 Fechada</option>
              </select>
            </div>
          )}

          {/* Botões */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createGallery.isPending || updateGallery.isPending}
              className="flex-1"
            >
              {(createGallery.isPending || updateGallery.isPending) && (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {gallery ? "💾 Atualizar" : "🎉 Criar"} Galeria
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
