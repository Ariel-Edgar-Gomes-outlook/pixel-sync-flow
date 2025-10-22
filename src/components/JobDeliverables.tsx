import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  useDeliverables, 
  useCreateDeliverable, 
  useMarkDeliverableAsSent,
  useDeleteDeliverable,
  type Deliverable 
} from '@/hooks/useDeliverables';
import { 
  FileText, 
  Image as ImageIcon, 
  Film, 
  File, 
  ExternalLink,
  Send,
  Trash2,
  Plus,
  Link as LinkIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface JobDeliverablesProps {
  jobId: string;
}

export function JobDeliverables({ jobId }: JobDeliverablesProps) {
  const { data: deliverables, isLoading } = useDeliverables(jobId);
  const createDeliverable = useCreateDeliverable();
  const markAsSent = useMarkDeliverableAsSent();
  const deleteDeliverable = useDeleteDeliverable();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deliverableToDelete, setDeliverableToDelete] = useState<string | null>(null);
  
  const [newDeliverable, setNewDeliverable] = useState({
    type: 'Foto Final',
    file_name: '',
    file_url: '',
    external_platform: 'gdrive' as string | null,
    access_instructions: '' as string | null,
  });

  const handleAddDeliverable = async () => {
    if (!newDeliverable.file_name || !newDeliverable.file_url) return;

    await createDeliverable.mutateAsync({
      job_id: jobId,
      type: newDeliverable.type,
      file_name: newDeliverable.file_name,
      file_url: newDeliverable.file_url,
      file_size: null,
      external_platform: newDeliverable.external_platform,
      access_instructions: newDeliverable.access_instructions,
    });

    setNewDeliverable({
      type: 'Foto Final',
      file_name: '',
      file_url: '',
      external_platform: 'gdrive',
      access_instructions: '',
    });
    setShowAddForm(false);
  };

  const handleMarkAsSent = async (id: string) => {
    await markAsSent.mutateAsync({ id, jobId });
  };

  const handleDelete = async (id: string) => {
    await deleteDeliverable.mutateAsync({ id, jobId });
    setDeleteDialogOpen(false);
    setDeliverableToDelete(null);
  };

  const getFileIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('foto') || lowerType.includes('imagem')) {
      return <ImageIcon className="h-5 w-5" />;
    }
    if (lowerType.includes('video') || lowerType.includes('vídeo')) {
      return <Film className="h-5 w-5" />;
    }
    if (lowerType.includes('pdf') || lowerType.includes('documento')) {
      return <FileText className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  };

  const platformIcons: Record<string, string> = {
    gdrive: '🔷',
    dropbox: '📦',
    wetransfer: '✈️',
    onedrive: '☁️',
    other: '🔗',
  };

  if (isLoading) {
    return <div>Carregando entregáveis...</div>;
  }

  const sentCount = deliverables?.filter(d => d.sent_to_client_at).length || 0;
  const pendingCount = (deliverables?.length || 0) - sentCount;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{deliverables?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Total de Entregáveis</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{sentCount}</div>
            <p className="text-sm text-muted-foreground">Enviados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Form */}
      {showAddForm ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Adicionar Link de Entregável
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={newDeliverable.type}
                  onValueChange={(value) => setNewDeliverable({ ...newDeliverable, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Foto Final">📸 Foto Final</SelectItem>
                    <SelectItem value="Foto RAW">🎞️ Foto RAW</SelectItem>
                    <SelectItem value="Vídeo">🎬 Vídeo</SelectItem>
                    <SelectItem value="PDF">📄 PDF</SelectItem>
                    <SelectItem value="Outro">📦 Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="platform">Plataforma</Label>
                <Select
                  value={newDeliverable.external_platform || 'gdrive'}
                  onValueChange={(value) => setNewDeliverable({ ...newDeliverable, external_platform: value })}
                >
                  <SelectTrigger id="platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gdrive">🔷 Google Drive</SelectItem>
                    <SelectItem value="dropbox">📦 Dropbox</SelectItem>
                    <SelectItem value="wetransfer">✈️ WeTransfer</SelectItem>
                    <SelectItem value="onedrive">☁️ OneDrive</SelectItem>
                    <SelectItem value="other">🔗 Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="file-name">Nome do Arquivo/Pasta</Label>
              <Input
                id="file-name"
                value={newDeliverable.file_name}
                onChange={(e) => setNewDeliverable({ ...newDeliverable, file_name: e.target.value })}
                placeholder="Ex: Fotos Editadas - Casamento Maria & João"
              />
            </div>

            <div>
              <Label htmlFor="file-url">URL do Link</Label>
              <Input
                id="file-url"
                type="url"
                value={newDeliverable.file_url}
                onChange={(e) => setNewDeliverable({ ...newDeliverable, file_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="instructions">Instruções de Acesso</Label>
              <Textarea
                id="instructions"
                value={newDeliverable.access_instructions || ''}
                onChange={(e) => setNewDeliverable({ ...newDeliverable, access_instructions: e.target.value })}
                placeholder="Ex: Senha: abc123, Baixe todas as fotos em alta resolução..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddDeliverable} disabled={!newDeliverable.file_name || !newDeliverable.file_url}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Link de Entregável
        </Button>
      )}

      {/* Deliverables List */}
      <div className="grid gap-4">
        {deliverables?.map((deliverable) => (
          <Card key={deliverable.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-muted rounded-lg">
                    {getFileIcon(deliverable.type)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{deliverable.file_name}</h3>
                      <Badge variant="secondary">{deliverable.type}</Badge>
                      {deliverable.version && (
                        <Badge variant="outline">{deliverable.version}</Badge>
                      )}
                      {deliverable.external_platform && (
                        <span className="text-xl">{platformIcons[deliverable.external_platform]}</span>
                      )}
                    </div>
                    
                    {deliverable.file_url && (
                      <a 
                        href={deliverable.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        {deliverable.file_url.substring(0, 60)}...
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    
                    {deliverable.access_instructions && (
                      <p className="text-sm text-muted-foreground">
                        📝 {deliverable.access_instructions}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Adicionado {formatDistanceToNow(new Date(deliverable.uploaded_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </span>
                      {deliverable.sent_to_client_at && (
                        <Badge variant="default" className="bg-green-600">
                          ✓ Enviado ao Cliente
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!deliverable.sent_to_client_at && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsSent(deliverable.id)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Marcar como Enviado
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDeliverableToDelete(deliverable.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {deliverables?.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="py-12 text-center">
            <File className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum entregável adicionado</h3>
            <p className="text-muted-foreground mb-4">
              Adicione links para fotos finais, vídeos ou outros arquivos
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Entregável
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este entregável? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deliverableToDelete && handleDelete(deliverableToDelete)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
