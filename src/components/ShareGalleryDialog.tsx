import { useState } from "react";
import bcrypt from "bcryptjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useUpdateGallery } from "@/hooks/useGalleries";
import { Share2, Copy, Lock } from "lucide-react";

interface ShareGalleryDialogProps {
  gallery: {
    id: string;
    name: string;
    share_token: string;
    password_protected: boolean;
    password_hash: string | null;
    gallery_links: any[];
  };
  children?: React.ReactNode;
}

export function ShareGalleryDialog({ gallery, children }: ShareGalleryDialogProps) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState(gallery.password_hash || "");
  const [selectedLinkIndices, setSelectedLinkIndices] = useState<number[]>(
    gallery.gallery_links.map((_, index) => index)
  );
  const { toast } = useToast();
  const updateGallery = useUpdateGallery();

  const galleryLinks = Array.isArray(gallery.gallery_links) ? gallery.gallery_links : [];

  const handleToggleLink = (index: number) => {
    setSelectedLinkIndices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handleSavePassword = async () => {
    try {
      let passwordHash = null;
      
      // Se houver senha, fazer hash antes de salvar
      if (password && password.length > 0) {
        const salt = await bcrypt.genSalt(10);
        passwordHash = await bcrypt.hash(password, salt);
      }

      await updateGallery.mutateAsync({
        id: gallery.id,
        password_protected: password.length > 0,
        password_hash: passwordHash,
      });

      toast({
        title: "Senha Atualizada!",
        description: password 
          ? "A galeria agora está protegida por senha" 
          : "A proteção por senha foi removida",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar senha",
        description: "Tente novamente mais tarde",
      });
    }
  };

  const generateShareLink = () => {
    const baseUrl = `${window.location.origin}/gallery/${gallery.share_token}`;
    if (selectedLinkIndices.length === galleryLinks.length) {
      return baseUrl;
    }
    const linkParams = selectedLinkIndices.sort().join(',');
    return `${baseUrl}?links=${linkParams}`;
  };

  const copyShareLink = () => {
    const link = generateShareLink();
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copiado!",
      description: "O link de partilha foi copiado para a área de transferência",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Partilhar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Partilhar Galeria: {gallery.name}</DialogTitle>
          <DialogDescription>
            Configure a senha e selecione os links que deseja partilhar com o cliente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Senha de Proteção */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="password">Senha de Acesso (opcional)</Label>
            </div>
            <div className="flex gap-2">
              <Input
                id="password"
                type="text"
                placeholder="Digite uma senha para proteção"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button onClick={handleSavePassword} variant="secondary">
                Guardar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {password 
                ? "🔒 Galeria protegida por senha. O cliente precisará inserir a senha para visualizar."
                : "🔓 Sem proteção por senha. Qualquer pessoa com o link poderá visualizar."}
            </p>
          </div>

          {/* Seleção de Links */}
          <div className="space-y-3">
            <Label>Links para Partilhar</Label>
            <div className="space-y-2">
              {galleryLinks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum link disponível nesta galeria
                </p>
              ) : (
                galleryLinks.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <Checkbox
                      id={`link-${index}`}
                      checked={selectedLinkIndices.includes(index)}
                      onCheckedChange={() => handleToggleLink(index)}
                    />
                    <label
                      htmlFor={`link-${index}`}
                      className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {link.name || `Link ${index + 1}`}
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({link.platform})
                      </span>
                    </label>
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedLinkIndices.length} de {galleryLinks.length} links selecionados
            </p>
          </div>

          {/* Link de Partilha */}
          <div className="space-y-3">
            <Label>Link de Partilha</Label>
            <div className="flex gap-2">
              <Input
                value={generateShareLink()}
                readOnly
                className="font-mono text-sm"
              />
              <Button onClick={copyShareLink} variant="default">
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Partilhe este link com o seu cliente. 
              {password && " Ele precisará da senha para acessar."}
            </p>
          </div>

          {/* Resumo */}
          {password && (
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-medium mb-2">📋 Informações para o Cliente:</p>
              <div className="space-y-1 text-sm">
                <p><strong>Link:</strong> <code className="bg-background px-2 py-1 rounded text-xs">{generateShareLink()}</code></p>
                <p><strong>Senha:</strong> <code className="bg-background px-2 py-1 rounded text-xs">{password}</code></p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
