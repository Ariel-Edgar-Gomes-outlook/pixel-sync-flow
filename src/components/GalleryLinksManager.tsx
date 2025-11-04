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
      <div className="space-y-3">
        <Label>Links de Galerias Externas</Label>
        
        {links.map((link, index) => <Card key={index}>
            <CardContent className="pt-4 px-px">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{platformIcons[link.type]}</span>
                    <div className="flex-1">
                      <p className="font-medium">{link.name}</p>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                        {link.url.substring(0, 50)}...
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  {link.password && <p className="text-sm text-muted-foreground">🔒 Senha: {link.password}</p>}
                  {link.instructions && <p className="text-sm text-muted-foreground">{link.instructions}</p>}
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveLink(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>)}
      </div>

      <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
        <h4 className="font-medium text-sm">Adicionar Novo Link</h4>
        
        <div className="grid gap-3">
          <div>
            <Label htmlFor="link-name">Nome da Galeria</Label>
            <Input id="link-name" placeholder="Ex: Fotos Finais Editadas" value={newLink.name} onChange={e => setNewLink({
            ...newLink,
            name: e.target.value
          })} />
          </div>

          <div>
            <Label htmlFor="link-type">Plataforma</Label>
            <Select value={newLink.type} onValueChange={value => setNewLink({
            ...newLink,
            type: value as GalleryLink['type']
          })}>
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

          <div>
            <Label htmlFor="link-url">URL do Link</Label>
            <Input id="link-url" type="url" placeholder="https://..." value={newLink.url} onChange={e => setNewLink({
            ...newLink,
            url: e.target.value
          })} />
          </div>

          <div>
            <Label htmlFor="link-password">Senha (opcional)</Label>
            <Input id="link-password" placeholder="Senha de acesso à galeria" value={newLink.password || ''} onChange={e => setNewLink({
            ...newLink,
            password: e.target.value
          })} />
          </div>

          <div>
            <Label htmlFor="link-instructions">Instruções (opcional)</Label>
            <Textarea id="link-instructions" placeholder="Ex: Baixe as fotos em alta resolução" rows={2} value={newLink.instructions || ''} onChange={e => setNewLink({
            ...newLink,
            instructions: e.target.value
          })} />
          </div>

          <Button type="button" onClick={handleAddLink} disabled={!newLink.name || !newLink.url} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Link
          </Button>
        </div>
      </div>
    </div>;
}