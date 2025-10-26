import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Edit, FileDown, CreditCard, Banknote, ChevronRight } from "lucide-react";
import { useSmartBadges } from "@/hooks/useSmartBadges";
import { EntityQuickLinks } from "@/components/EntityQuickLinks";

interface QuoteCardProps {
  quote: any;
  statusConfig: Record<string, { label: string; variant: any }>;
  onViewPDF: (quote: any) => void;
  onEdit: (quote: any) => void;
  onGenerateInvoice: (quote: any) => void;
  onConvertToJob: (quote: any) => void;
  onSetPaymentPlan: (quote: any) => void;
}

export function QuoteCard({
  quote,
  statusConfig,
  onViewPDF,
  onEdit,
  onGenerateInvoice,
  onConvertToJob,
  onSetPaymentPlan,
}: QuoteCardProps) {
  const smartBadges = useSmartBadges({ entityType: 'quote', entity: quote });

  return (
    <Card className="p-4 sm:p-5 hover:shadow-md transition-all">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold truncate">
                {quote.clients?.name || 'Cliente não encontrado'}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge 
                variant={statusConfig[quote.status]?.variant || "secondary"}
                className="text-xs"
              >
                {statusConfig[quote.status]?.label || quote.status}
              </Badge>
              {smartBadges.map((badge) => (
                <Badge 
                  key={badge.id}
                  variant={badge.variant as any}
                  className="text-xs"
                  title={badge.tooltip}
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1 shrink-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {quote.total?.toLocaleString('pt-PT', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })} {quote.currency || 'AOA'}
            </div>
            {quote.validity_date && (
              <p className="text-xs text-muted-foreground">
                Válido até {new Date(quote.validity_date).toLocaleDateString('pt-PT')}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Criado:</span>{' '}
            <span className="font-medium">
              {new Date(quote.created_at).toLocaleDateString('pt-PT')}
            </span>
          </div>
          {quote.accepted_at && (
            <div>
              <span className="text-muted-foreground">Aceite:</span>{' '}
              <span className="font-medium text-success">
                {new Date(quote.accepted_at).toLocaleDateString('pt-PT')}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onViewPDF(quote)}
            className="flex-1 sm:flex-initial"
          >
            <Eye className="h-4 w-4" />
            <span className="sm:inline">Ver PDF</span>
          </Button>

          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onEdit(quote)}
            className="flex-1 sm:flex-initial"
          >
            <Edit className="h-4 w-4" />
            <span className="sm:inline">Editar</span>
          </Button>

          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onGenerateInvoice(quote)}
            className="flex-1 sm:flex-initial"
          >
            <FileDown className="h-4 w-4" />
            <span className="sm:inline">Criar Fatura</span>
          </Button>

          {quote.status === 'accepted' && (
            <>
              <Button
                size="sm"
                variant="default"
                onClick={() => onConvertToJob(quote)}
                className="flex-1 sm:flex-initial"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sm:inline">Converter em Job</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onSetPaymentPlan(quote)}
                className="flex-1 sm:flex-initial"
              >
                <CreditCard className="h-4 w-4" />
                <span className="sm:inline">Plano Pagamento</span>
              </Button>
            </>
          )}

          <EntityQuickLinks 
            links={[
              { type: 'client', id: quote.client_id, name: quote.clients?.name || 'Cliente' },
              ...(quote.job_id ? [{ type: 'job' as const, id: quote.job_id, name: 'Job Criado', status: 'convertido' }] : []),
            ]}
          />
        </div>
      </div>
    </Card>
  );
}
