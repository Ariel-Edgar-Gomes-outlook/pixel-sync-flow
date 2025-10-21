import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/FileUpload";
import { useDeliverables, useMarkDeliverableAsSent, useDeleteDeliverable, useCreateDeliverable } from "@/hooks/useDeliverables";
import { toast } from "sonner";
import { Upload, Send, Trash2, Download, ExternalLink, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";

interface JobDeliverablesProps {
  jobId: string;
  externalAssetsLinks?: string[];
  externalGalleryLink?: string | null;
}

export function JobDeliverables({ jobId }: JobDeliverablesProps) {
  const { data: deliverables, isLoading } = useDeliverables(jobId);
  const markAsSent = useMarkDeliverableAsSent();
  const deleteDeliverable = useDeleteDeliverable();
  const createDeliverable = useCreateDeliverable();
  const [uploadingType, setUploadingType] = useState<string>("");

  const handleUploadComplete = async (url: string, fileName: string, fileSize: number) => {
    await createDeliverable.mutateAsync({
      job_id: jobId,
      file_url: url,
      file_name: fileName,
      file_size: fileSize,
      type: uploadingType,
    });
    setUploadingType("");
  };

  const handleMarkAsSent = async (id: string) => {
    await markAsSent.mutateAsync({ id, jobId });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja remover este arquivo dos entregáveis?")) {
      await deleteDeliverable.mutateAsync({ id, jobId });
    }
  };

  const getFileType = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
    if (['mp4', 'mov', 'avi'].includes(extension || '')) return 'video';
    if (['pdf'].includes(extension || '')) return 'pdf';
    return 'file';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-5 w-5" />;
      case 'video': return <ImageIcon className="h-5 w-5" />;
      default: return <Download className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <Upload className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-base font-semibold text-foreground">Upload de Entregáveis</h3>
            <p className="text-xs text-muted-foreground">Adicione fotos, vídeos ou arquivos finais</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo de Arquivo</label>
            <div className="flex flex-wrap gap-2 mb-3">
              <Button
                type="button"
                variant={uploadingType === "Foto Final" ? "default" : "outline"}
                size="sm"
                onClick={() => setUploadingType("Foto Final")}
              >
                📸 Foto Final
              </Button>
              <Button
                type="button"
                variant={uploadingType === "Vídeo" ? "default" : "outline"}
                size="sm"
                onClick={() => setUploadingType("Vídeo")}
              >
                🎥 Vídeo
              </Button>
              <Button
                type="button"
                variant={uploadingType === "RAW" ? "default" : "outline"}
                size="sm"
                onClick={() => setUploadingType("RAW")}
              >
                📂 RAW
              </Button>
              <Button
                type="button"
                variant={uploadingType === "Outro" ? "default" : "outline"}
                size="sm"
                onClick={() => setUploadingType("Outro")}
              >
                📄 Outro
              </Button>
            </div>

            {uploadingType && (
              <FileUpload
                bucket="deliverables"
                onUploadComplete={handleUploadComplete}
                accept="image/*,video/*,.pdf,.raw,.cr2,.nef"
                label={`Upload ${uploadingType}`}
              />
            )}
          </div>
        </div>
      </Card>

      {/* Gallery Section */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Galeria de Entregáveis</h3>
            <p className="text-xs text-muted-foreground">Todos os arquivos enviados para este job</p>
          </div>
          <Badge variant="outline">
            {deliverables?.length || 0} arquivos
          </Badge>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : !deliverables || deliverables.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum arquivo enviado ainda</p>
            <p className="text-xs text-muted-foreground mt-1">Selecione um tipo acima e faça o upload</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliverables.map((deliverable) => {
              const fileType = getFileType(deliverable.file_url);
              const isSent = !!deliverable.sent_to_client_at;

              return (
                <Card key={deliverable.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="space-y-3">
                    {/* File Preview */}
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                      {fileType === 'image' ? (
                        <img
                          src={deliverable.file_url}
                          alt={deliverable.file_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          {getFileIcon(fileType)}
                          <span className="text-xs">{deliverable.type}</span>
                        </div>
                      )}
                      <Badge 
                        variant={isSent ? "success" : "secondary"}
                        className="absolute top-2 right-2"
                      >
                        {isSent ? "Enviado" : "Novo"}
                      </Badge>
                    </div>

                    {/* File Info */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium truncate">{deliverable.file_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{deliverable.type}</span>
                        {deliverable.file_size && (
                          <>
                            <span>•</span>
                            <span>{(deliverable.file_size / 1024 / 1024).toFixed(2)} MB</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(deliverable.uploaded_at), 'dd/MM/yyyy HH:mm')}
                      </p>
                      {isSent && deliverable.sent_to_client_at && (
                        <p className="text-xs text-green-600">
                          ✓ Enviado em {format(new Date(deliverable.sent_to_client_at), 'dd/MM/yyyy')}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(deliverable.file_url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Abrir
                      </Button>
                      {!isSent && (
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleMarkAsSent(deliverable.id)}
                          disabled={markAsSent.isPending}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Enviar
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(deliverable.id)}
                        disabled={deleteDeliverable.isPending}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* Summary */}
      {deliverables && deliverables.length > 0 && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{deliverables.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Enviados</p>
              <p className="text-2xl font-bold text-green-600">
                {deliverables.filter(d => d.sent_to_client_at).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold text-orange-600">
                {deliverables.filter(d => !d.sent_to_client_at).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tamanho Total</p>
              <p className="text-2xl font-bold">
                {(deliverables.reduce((sum, d) => sum + (d.file_size || 0), 0) / 1024 / 1024).toFixed(0)} MB
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
