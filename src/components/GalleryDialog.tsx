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
  const [formData, setFormData] = useState<Partial<Gallery>>({
    job_id: jobId,
    name: gallery?.name || "",
    password_protected: gallery?.password_protected || false,
    allow_selection: gallery?.allow_selection ?? true,
    download_limit: gallery?.download_limit || null,
    status: gallery?.status || "active",
    gallery_links: gallery?.gallery_links || [],
    access_instructions: gallery?.access_instructions || "",
  });
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(
    gallery?.expiration_date ? new Date(gallery.expiration_date) : undefined
  );
  const [password, setPassword] = useState("");
  const [galleryLinks, setGalleryLinks] = useState<GalleryLink[]>(gallery?.gallery_links || []);

  const createGallery = useCreateGallery();
  const updateGallery = useUpdateGallery();
  const { toast } = useToast();

  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const galleryData = {
        ...formData,
        expiration_date: expirationDate?.toISOString() || null,
        password_hash: password ? password : null,
        gallery_links: galleryLinks as any,
      };

      if (gallery) {
        await updateGallery.mutateAsync({ id: gallery.id, ...galleryData });
        toast({
          title: "Sucesso",
          description: "Galeria atualizada com sucesso",
        });
      } else {
        const newGallery = await createGallery.mutateAsync(galleryData);
        toast({
          title: "Sucesso",
          description: `Galeria criada! Token: ${newGallery.share_token}`,
        });
      }
      
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
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
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Galeria</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Casamento João e Maria"
              required
            />
          </div>

          <GalleryLinksManager links={galleryLinks} onChange={setGalleryLinks} />

          <div>
            <Label htmlFor="access-instructions">Instruções Gerais de Acesso</Label>
            <Textarea
              id="access-instructions"
              value={formData.access_instructions || ""}
              onChange={(e) => setFormData({ ...formData, access_instructions: e.target.value })}
              placeholder="Instruções gerais para o cliente acessar as galerias..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="password_protected">Proteger com Senha</Label>
            <Switch
              id="password_protected"
              checked={formData.password_protected}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, password_protected: checked })
              }
            />
          </div>

          {formData.password_protected && (
            <div>
              <Label htmlFor="password">Senha de Acesso</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="allow_selection">Permitir Cliente Selecionar Favoritas</Label>
            <Switch
              id="allow_selection"
              checked={formData.allow_selection}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, allow_selection: checked })
              }
            />
          </div>

          <div>
            <Label htmlFor="download_limit">Limite de Downloads</Label>
            <Input
              id="download_limit"
              type="number"
              value={formData.download_limit || ""}
              onChange={(e) => 
                setFormData({ ...formData, download_limit: e.target.value ? parseInt(e.target.value) : null })
              }
              placeholder="Ilimitado"
            />
          </div>

          <div>
            <Label>Data de Expiração</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expirationDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expirationDate ? format(expirationDate, "PPP") : "Sem expiração"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expirationDate}
                  onSelect={setExpirationDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {gallery && (
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="active">Ativa</option>
                <option value="expired">Expirada</option>
                <option value="closed">Fechada</option>
              </select>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createGallery.isPending || updateGallery.isPending}>
              {gallery ? "Atualizar" : "Criar"} Galeria
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
