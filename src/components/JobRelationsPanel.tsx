import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, FileText, CreditCard, Receipt, FileCheck, Package, Wrench, ExternalLink } from "lucide-react";
import { useJobQuote, useJobContract, useJobInvoices, useJobPayments, useJobDeliverables, useJobResources } from "@/hooks/useJobRelations";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "@/hooks/useCurrency";

interface JobRelationsPanelProps {
  jobId: string;
  clientName?: string;
}

export function JobRelationsPanel({ jobId, clientName }: JobRelationsPanelProps) {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const { data: quote } = useJobQuote(jobId);
  const { data: contract } = useJobContract(jobId);
  const { data: invoices } = useJobInvoices(jobId);
  const { data: payments } = useJobPayments(jobId);
  const { data: deliverables } = useJobDeliverables(jobId);
  const { data: resources } = useJobResources(jobId);

  const totalPaid = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const totalPending = payments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  
  const deliveredCount = deliverables?.filter(d => d.sent_to_client_at).length || 0;
  const totalDeliverables = deliverables?.length || 0;

  return (
    <div className="space-y-4">
      {/* Client */}
      {clientName && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-medium">Cliente</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{clientName}</span>
              <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/clients')}>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Quote */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="font-medium">Orçamento</span>
          </div>
          {quote ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline">{quote.status}</Badge>
              <span className="text-sm font-bold">{formatCurrency(Number(quote.total))}</span>
              <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/quotes')}>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Badge variant="secondary">Sem orçamento</Badge>
          )}
        </div>
      </Card>

      {/* Contract */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-primary" />
            <span className="font-medium">Contrato</span>
          </div>
          {contract ? (
            <div className="flex items-center gap-2">
              <Badge variant={contract.status === 'signed' ? 'success' : 'warning'}>
                {contract.status}
              </Badge>
              <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/contracts')}>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Badge variant="secondary">Sem contrato</Badge>
          )}
        </div>
      </Card>

      {/* Invoices */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <span className="font-medium">Faturas</span>
          </div>
          {invoices && invoices.length > 0 ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline">{invoices.length} fatura(s)</Badge>
              <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/invoices')}>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Badge variant="secondary">Sem faturas</Badge>
          )}
        </div>
      </Card>

      {/* Payments */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            <span className="font-medium">Pagamentos</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-success">Pago: {formatCurrency(totalPaid)}</span>
              {payments && payments.length > 0 && (
                <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/payments')}>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
            {totalPending > 0 && (
              <span className="text-xs text-warning">Pendente: {formatCurrency(totalPending)}</span>
            )}
          </div>
        </div>
      </Card>

      {/* Deliverables */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <span className="font-medium">Entregáveis</span>
          </div>
          {totalDeliverables > 0 ? (
            <Badge variant={deliveredCount === totalDeliverables ? 'success' : 'warning'}>
              {deliveredCount} de {totalDeliverables} entregues
            </Badge>
          ) : (
            <Badge variant="secondary">Sem entregáveis</Badge>
          )}
        </div>
      </Card>

      {/* Resources */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            <span className="font-medium">Recursos</span>
          </div>
          {resources && resources.length > 0 ? (
            <Badge variant="outline">{resources.length} recurso(s)</Badge>
          ) : (
            <Badge variant="secondary">Sem recursos</Badge>
          )}
        </div>
      </Card>
    </div>
  );
}
