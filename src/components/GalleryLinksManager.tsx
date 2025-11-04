import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { GalleryLink } from '@/hooks/useGalleries';
interface GalleryLinksManagerProps {
  links: GalleryLink[];
  onChange: (links: GalleryLink[]) => void;
}
export function GalleryLinksManager({
  links,
  onChange
}: GalleryLinksManagerProps) {
  const [newLink, setNewLink] = useState<Partial<GalleryLink>>({
    name: '',
    url: '',
    type: 'gdrive'
  });
  const handleAddLink = () => {
    if (!newLink.name || !newLink.url) return;
    onChange([...links, newLink as GalleryLink]);
    setNewLink({
      name: '',
      url: '',
      type: 'gdrive'
    });
  };
  const handleRemoveLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };
  const platformIcons: Record<string, string> = {
    gdrive: '🔷',
    dropbox: '📦',
    wetransfer: '✈️',
    onedrive: '☁️',
    pixieset: '📸',
    other: '🔗'
  };
  return <div className="space-y-4">
      {/* Lista de Links Existentes */}
      {links.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Links de Galerias Externas</Label>
          
          {links.map((link, index) => <Card key={index} className="group hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl shrink-0">{platformIcons[link.type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm mb-1">{link.name}</p>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors break-all"
                        >
                          {link.url.length > 60 ? `${link.url.substring(0, 60)}...` : link.url}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    </div>
                    {link.password && (
                      <div className="flex items-center gap-2 text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-lg">
                        🔒 <span className="font-medium">Senha:</span> <code className="font-mono">{link.password}</code>
                      </div>
                    )}
                    {link.instructions && (
                      <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                        💡 {link.instructions}
                      </p>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveLink(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>)}
        </div>
      )}

      {/* Form para Adicionar Novo Link */}
      <div className="space-y-4 p-5 border-2 border-dashed border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-all">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-sm">Adicionar Novo Link Externo</h4>
        </div>
        
        <div className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="link-name" className="text-xs font-medium">Nome da Galeria</Label>
              <Input 
                id="link-name" 
                placeholder="Ex: Fotos Finais Editadas" 
                value={newLink.name || ''} 
                onChange={e => setNewLink({ ...newLink, name: e.target.value })} 
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="link-type" className="text-xs font-medium">Plataforma</Label>
              <Select 
                value={newLink.type} 
                onValueChange={value => setNewLink({ ...newLink, type: value as GalleryLink['type'] })}
              >
                <SelectTrigger id="link-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gdrive">🔷 Google Drive</SelectItem>
                  <SelectItem value="dropbox">📦 Dropbox</SelectItem>
                  <SelectItem value="wetransfer">✈️ WeTransfer</SelectItem>
                  <SelectItem value="onedrive">☁️ OneDrive</SelectItem>
                  <SelectItem value="pixieset">📸 Pixieset</SelectItem>
                  <SelectItem value="other">🔗 Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="link-url" className="text-xs font-medium">URL do Link</Label>
            <Input 
              id="link-url" 
              type="url" 
              placeholder="https://..." 
              value={newLink.url || ''} 
              onChange={e => setNewLink({ ...newLink, url: e.target.value })} 
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="link-password" className="text-xs font-medium">Senha (opcional)</Label>
              <Input 
                id="link-password" 
                type="text"
                placeholder="Senha de acesso" 
                value={newLink.password || ''} 
                onChange={e => setNewLink({ ...newLink, password: e.target.value })} 
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="link-instructions" className="text-xs font-medium">Instruções (opcional)</Label>
              <Input 
                id="link-instructions" 
                placeholder="Ex: Baixe em alta resolução" 
                value={newLink.instructions || ''} 
                onChange={e => setNewLink({ ...newLink, instructions: e.target.value })} 
              />
            </div>
          </div>

          <Button 
            type="button" 
            onClick={handleAddLink} 
            disabled={!newLink.name?.trim() || !newLink.url?.trim()} 
            className="w-full"
            variant="secondary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Link à Galeria
          </Button>
        </div>
      </div>
    </div>;
}