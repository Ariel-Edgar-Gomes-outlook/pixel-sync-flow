import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Edit, Link2, Send } from "lucide-react";
import { EntityQuickLinks } from "@/components/EntityQuickLinks";
import { useSmartBadges } from "@/hooks/useSmartBadges";

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
}

export function ContractCard({
  contract,
  onEdit,
  onCopyLink,
  onSendForSignature,
  onViewPDF,
}: ContractCardProps) {
  const smartBadges = useSmartBadges({ entityType: 'contract', entity: contract });

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
            <Button 
              onClick={() => onSendForSignature(contract)} 
              variant="default"
              size="sm"
            >
              <Send className="h-3 w-3 sm:mr-2" />
              <span className="hidden sm:inline">Enviar</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
