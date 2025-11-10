import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, FileText, CreditCard, Receipt, FileCheck, ExternalLink, DollarSign } from "lucide-react";
import { useClientJobs, useClientQuotes, useClientInvoices, useClientPayments, useClientContracts } from "@/hooks/useClientRelations";
import { useNavigate } from "react-router-dom";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type?: string;
}

interface ClientDetailsDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientDetailsDialog({ client, open, onOpenChange }: ClientDetailsDialogProps) {
  const navigate = useNavigate();
  const { data: jobs } = useClientJobs(client?.id);
  const { data: quotes } = useClientQuotes(client?.id);
  const { data: invoices } = useClientInvoices(client?.id);
  const { data: payments } = useClientPayments(client?.id);
  const { data: contracts } = useClientContracts(client?.id);

  const totalPaid = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const totalPending = payments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const totalOverdue = invoices?.filter(i => i.status === 'overdue').reduce((sum, i) => sum + Number(i.total), 0) || 0;

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{client.name}</DialogTitle>
          {client.email && <p className="text-sm text-muted-foreground">{client.email}</p>}
        </DialogHeader>

        {/* Financial Summary */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-success" />
              <span className="text-sm font-medium">Total Pago</span>
            </div>
            <p className="text-2xl font-bold text-success">Kz {totalPaid.toFixed(2)}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Pendente</span>
            </div>
            <p className="text-2xl font-bold text-warning">Kz {totalPending.toFixed(2)}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">Vencido</span>
            </div>
            <p className="text-2xl font-bold text-destructive">Kz {totalOverdue.toFixed(2)}</p>
          </Card>
        </div>

        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="jobs">
              Jobs ({jobs?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="quotes">
              Orçamentos ({quotes?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="invoices">
              Faturas ({invoices?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="payments">
              Pagamentos ({payments?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="contracts">
              Contratos ({contracts?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-3 mt-4">
            {jobs && jobs.length > 0 ? (
              jobs.map((job: any) => (
                <Card key={job.id} className="p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold">{job.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{job.type}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(job.start_datetime).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate('/dashboard/jobs')}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum job encontrado</p>
            )}
          </TabsContent>

          <TabsContent value="quotes" className="space-y-3 mt-4">
            {quotes && quotes.length > 0 ? (
              quotes.map((quote: any) => (
                <Card key={quote.id} className="p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <Badge>{quote.status}</Badge>
                      </div>
                      <p className="text-lg font-bold mt-2">Kz {Number(quote.total).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(quote.created_at).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate('/dashboard/quotes')}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum orçamento encontrado</p>
            )}
          </TabsContent>

          <TabsContent value="invoices" className="space-y-3 mt-4">
            {invoices && invoices.length > 0 ? (
              invoices.map((invoice: any) => (
                <Card key={invoice.id} className="p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <span className="font-medium">{invoice.invoice_number}</span>
                        <Badge>{invoice.status}</Badge>
                      </div>
                      <p className="text-lg font-bold mt-2">Kz {Number(invoice.total).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Emitida: {new Date(invoice.issue_date).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate('/dashboard/invoices')}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhuma fatura encontrada</p>
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-3 mt-4">
            {payments && payments.length > 0 ? (
              payments.map((payment: any) => (
                <Card key={payment.id} className="p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-primary" />
                        <Badge>{payment.status}</Badge>
                      </div>
                      <p className="text-lg font-bold mt-2">Kz {Number(payment.amount).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {payment.type} • {new Date(payment.created_at).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate('/dashboard/payments')}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum pagamento encontrado</p>
            )}
          </TabsContent>

          <TabsContent value="contracts" className="space-y-3 mt-4">
            {contracts && contracts.length > 0 ? (
              contracts.map((contract: any) => (
                <Card key={contract.id} className="p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-primary" />
                        <Badge>{contract.status}</Badge>
                      </div>
                      {contract.jobs && (
                        <p className="text-sm mt-2">{contract.jobs.title}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(contract.issued_at || contract.created_at).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate('/dashboard/contracts')}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum contrato encontrado</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
