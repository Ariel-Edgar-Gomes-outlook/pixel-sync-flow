import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Edit, Link2, Send, Download, CheckCircle } from "lucide-react";
import { EntityQuickLinks } from "@/components/EntityQuickLinks";
import { useSmartBadges } from "@/hooks/useSmartBadges";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const statusConfig = {
  draft: { label: "Rascunho", variant: "secondary" as const },
  sent: { label: "Enviado", variant: "default" as const },
  pending_signature: { label: "Aguardando Assinatura", variant: "warning" as const },
  signed: { label: "Assinado", variant: "success" as const },
  active: { label: "Ativo", variant: "success" as const },
  cancelled: { label: "Cancelado", variant: "destructive" as const },
};

interface ContractCardProps {
  contract: any;
  onEdit: (contract: any) => void;
  onCopyLink: (contract: any) => void;
  onSendForSignature: (contract: any) => void;
  onViewPDF: (contract: any) => void;
  onRefresh?: () => void;
}

export function ContractCard({
  contract,
  onEdit,
  onCopyLink,
  onSendForSignature,
  onViewPDF,
  onRefresh,
}: ContractCardProps) {
  const smartBadges = useSmartBadges({ entityType: 'contract', entity: contract });
  const { toast } = useToast();

  const handleMarkAsSigned = async () => {
    try {
      const { error } = await supabase
        .from('contracts')
        .update({
          status: 'signed',
          signed_at: new Date().toISOString(),
          signature_type: 'manual',
        })
        .eq('id', contract.id);

      if (error) throw error;

      toast({
        title: "Contrato marcado como assinado",
        description: "O contrato foi marcado como assinado manualmente.",
      });

      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      console.error('Error marking as signed:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível marcar o contrato como assinado.",
      });
    }
  };

  const handleDownloadPDF = async () => {
    if (!contract.pdf_url) {
      toast({
        variant: "destructive",
        title: "PDF não disponível",
        description: "O PDF deste contrato ainda não foi gerado.",
      });
      return;
    }

    try {
      const response = await fetch(contract.pdf_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrato_${contract.clients?.name || 'cliente'}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download iniciado",
        description: "O PDF do contrato está sendo baixado.",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        variant: "destructive",
        title: "Erro no download",
        description: "Não foi possível baixar o PDF. Tente novamente.",
      });
    }
  };

  return (
    <Card className="p-4 sm:p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-2">
          <FileText className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg truncate">
              {contract.clients?.name || 'Cliente não especificado'}
            </h3>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant={statusConfig[contract.status as keyof typeof statusConfig]?.variant || 'default'}>
                {statusConfig[contract.status as keyof typeof statusConfig]?.label || contract.status}
              </Badge>
              {smartBadges.map((badge) => (
                <Badge 
                  key={badge.id} 
                  variant={badge.variant}
                  className="text-xs"
                  title={badge.tooltip}
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <EntityQuickLinks 
            links={[
              { type: 'client', id: contract.client_id, name: contract.clients?.name || 'Cliente' },
              ...(contract.job_id ? [{ type: 'job' as const, id: contract.job_id, name: contract.jobs?.title || 'Job' }] : []),
            ]}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Emitido:</span>
              <p className="font-medium">
                {new Date(contract.issued_at || contract.created_at).toLocaleDateString('pt-PT')}
              </p>
            </div>
            {contract.signed_at && (
              <div>
                <span className="text-muted-foreground">Assinado:</span>
                <p className="font-medium text-success">
                  {new Date(contract.signed_at).toLocaleDateString('pt-PT')}
                </p>
              </div>
            )}
            {contract.cancellation_fee && (
              <div>
                <span className="text-muted-foreground">Taxa Cancelamento:</span>
                <p className="font-medium">Kz {Number(contract.cancellation_fee).toFixed(2)}</p>
              </div>
            )}
          </div>

          {contract.status === 'signed' && contract.signature_url && (
            <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Assinatura Digital:</span>
                <Badge variant="outline" className="text-xs">
                  {contract.signature_type === 'manual' ? 'Assinatura Manual' : 'Assinatura Digital'}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <div 
                  className="relative w-32 h-16 bg-white rounded border border-border overflow-hidden cursor-pointer hover:border-primary transition-colors"
                  onClick={() => window.open(contract.signature_url, '_blank')}
                  title="Clique para ampliar assinatura"
                >
                  <img 
                    src={contract.signature_url} 
                    alt="Assinatura do cliente" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      console.error('Failed to load signature:', contract.signature_url);
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-muted-foreground flex items-center justify-center h-full">Erro ao carregar</span>';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{contract.clients?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(contract.signed_at).toLocaleDateString('pt-PT', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {contract.status === 'signed' && !contract.signature_url && (
            <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <div className="flex-1">
                  <p className="text-xs font-medium">Assinado Manualmente</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(contract.signed_at).toLocaleDateString('pt-PT', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewPDF(contract)}
          >
            <FileText className="h-3 w-3 sm:mr-2" />
            <span className="hidden sm:inline">Ver PDF</span>
          </Button>

          {contract.status === 'signed' && contract.pdf_url && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadPDF}
            >
              <Download className="h-3 w-3 sm:mr-2" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(contract)}
          >
            <Edit className="h-3 w-3 sm:mr-2" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
          
          <Button 
            onClick={() => onCopyLink(contract)} 
            variant="outline"
            size="sm"
          >
            <Link2 className="h-3 w-3 sm:mr-2" />
            <span className="hidden sm:inline">Link</span>
          </Button>
          
          {!['signed', 'active', 'cancelled'].includes(contract.status) && (
            <>
              <Button 
                onClick={() => onSendForSignature(contract)} 
                variant="default"
                size="sm"
              >
                <Send className="h-3 w-3 sm:mr-2" />
                <span className="hidden sm:inline">Enviar</span>
              </Button>
              <Button 
                onClick={handleMarkAsSigned}
                variant="outline"
                size="sm"
                className="border-success text-success hover:bg-success/10"
              >
                <CheckCircle className="h-3 w-3 sm:mr-2" />
                <span className="hidden sm:inline">Marcar Assinado</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
