import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateGallery, type GalleryLink } from "@/hooks/useGalleries";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface AddLinkDialogProps {
  galleryId: string;
  existingLinks: GalleryLink[];
}

export function AddLinkDialog({ galleryId, existingLinks }: AddLinkDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("other");
  const [url, setUrl] = useState("");
  const [password, setPassword] = useState("");
  const [instructions, setInstructions] = useState("");

  const updateGallery = useUpdateGallery();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!name.trim() || !url.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome e a URL do link.",
        variant: "destructive",
      });
      return;
    }

    const newLink: GalleryLink = {
      name: name.trim(),
      url: url.trim(),
      type: platform as GalleryLink['type'],
      password: password.trim() || undefined,
      instructions: instructions.trim() || undefined,
    };

    try {
      await updateGallery.mutateAsync({
        id: galleryId,
        gallery_links: [...existingLinks, newLink],
      });

      toast({
        title: "Link adicionado!",
        description: "O link foi adicionado à galeria com sucesso.",
      });

      // Reset form
      setName("");
      setUrl("");
      setPassword("");
      setInstructions("");
      setPlatform("other");
      setOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao adicionar link",
        description: "Ocorreu um erro ao adicionar o link. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Link
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Link</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="link-name">Nome do Link *</Label>
            <Input
              id="link-name"
              placeholder="Ex: Fotos Editadas, Versão Final"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-platform">Plataforma</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger id="link-platform">
                <SelectValue placeholder="Selecione a plataforma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gdrive">Google Drive</SelectItem>
                <SelectItem value="dropbox">Dropbox</SelectItem>
                <SelectItem value="wetransfer">WeTransfer</SelectItem>
                <SelectItem value="onedrive">OneDrive</SelectItem>
                <SelectItem value="pixieset">Pixieset</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-url">URL do Link *</Label>
            <Input
              id="link-url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-password">Senha (opcional)</Label>
            <Input
              id="link-password"
              placeholder="Senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-instructions">Instruções de Acesso (opcional)</Label>
            <Textarea
              id="link-instructions"
              placeholder="Instruções para acessar o conteúdo..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={updateGallery.isPending}>
            {updateGallery.isPending ? "Adicionando..." : "Adicionar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
