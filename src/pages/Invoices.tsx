import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InvoiceDialog } from '@/components/InvoiceDialog';
import { useInvoices, useInvoiceStats, useUpdateInvoice } from '@/hooks/useInvoices';
import {
  Plus,
  Search,
  FileText,
  Edit,
  XCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';

const statusConfig = {
  issued: { label: 'Emitida', variant: 'default' as const, icon: FileText },
  paid: { label: 'Paga', variant: 'success' as const, icon: CheckCircle },
  overdue: { label: 'Vencida', variant: 'destructive' as const, icon: AlertCircle },
  cancelled: { label: 'Cancelada', variant: 'secondary' as const, icon: XCircle },
  partial: { label: 'Parcial', variant: 'outline' as const, icon: Clock },
};

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const { data: invoices, isLoading } = useInvoices();
  const { data: stats } = useInvoiceStats();
  const updateInvoice = useUpdateInvoice();

  const handleEdit = (invoice: any) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedInvoice(null);
  };

  const handleMarkAsPaid = async (invoice: any) => {
    await updateInvoice.mutateAsync({
      id: invoice.id,
      status: 'paid',
      paid_date: new Date().toISOString().split('T')[0],
      amount_paid: invoice.total,
    });
  };

  const handleCancel = async (invoice: any) => {
    await updateInvoice.mutateAsync({
      id: invoice.id,
      status: 'cancelled',
    });
  };

  const handleViewPDF = (invoice: any) => {
    if (invoice.pdf_url) {
      window.open(invoice.pdf_url, '_blank');
    } else {
      toast.error('PDF não disponível');
    }
  };

  const handleSendEmail = async (invoice: any) => {
    try {
      toast.loading('A enviar email...');
      
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: { invoice_id: invoice.id }
      });

      if (error) throw error;

      toast.dismiss();
      toast.success('Email enviado com sucesso!');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.dismiss();
      toast.error('Erro ao enviar email. Verifique se configurou a RESEND_API_KEY');
    }
  };

  const filteredInvoices = invoices?.filter((invoice: any) => {
    const matchesSearch =
      searchQuery === '' ||
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.clients?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Faturas</h1>
          <p className="text-muted-foreground">Gestão completa de faturação</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Fatura
        </Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Faturado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalInvoiced.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} AOA
              </div>
              <p className="text-xs text-muted-foreground">{stats.invoiceCount} faturas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalPending.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} AOA
              </div>
              <p className="text-xs text-muted-foreground">{stats.pendingCount} faturas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencido</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stats.totalOverdue.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} AOA
              </div>
              <p className="text-xs text-muted-foreground">{stats.overdueCount} faturas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pago</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.totalPaid.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} AOA
              </div>
              <p className="text-xs text-muted-foreground">{stats.paidCount} faturas</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por número ou cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="issued">Emitidas</SelectItem>
                <SelectItem value="paid">Pagas</SelectItem>
                <SelectItem value="overdue">Vencidas</SelectItem>
                <SelectItem value="partial">Parciais</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!filteredInvoices || filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Nenhuma fatura encontrada</p>
            <p className="text-muted-foreground mb-4">Comece criando sua primeira fatura</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Fatura
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredInvoices.map((invoice: any) => {
            const status = statusConfig[invoice.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;

            return (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{invoice.invoice_number}</h3>
                        <Badge variant={status.variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                        {invoice.is_proforma && <Badge variant="outline">Pro-Forma</Badge>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Cliente:</span>
                          <p className="font-medium">{invoice.clients?.name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Data de Emissão:</span>
                          <p className="font-medium">
                            {new Date(invoice.issue_date).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                        {invoice.due_date && (
                          <div>
                            <span className="text-muted-foreground">Vencimento:</span>
                            <p className="font-medium">
                              {new Date(invoice.due_date).toLocaleDateString('pt-PT')}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 pt-2">
                        <div>
                          <span className="text-sm text-muted-foreground">Total:</span>
                          <p className="text-xl font-bold">
                            {invoice.total.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}{' '}
                            {invoice.currency}
                          </p>
                        </div>
                        {invoice.amount_paid > 0 && invoice.status !== 'paid' && (
                          <div>
                            <span className="text-sm text-muted-foreground">Pago:</span>
                            <p className="text-lg font-semibold text-green-600">
                              {invoice.amount_paid.toLocaleString('pt-PT', {
                                minimumFractionDigits: 2,
                              })}{' '}
                              {invoice.currency}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {invoice.pdf_url && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleViewPDF(invoice)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Ver PDF
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleSendEmail(invoice)}>
                            <Mail className="h-4 w-4 mr-2" />
                            Enviar Email
                          </Button>
                        </>
                      )}
                      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsPaid(invoice)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Marcar Paga
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(invoice)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                        <Button variant="ghost" size="sm" onClick={() => handleCancel(invoice)}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <InvoiceDialog invoice={selectedInvoice} open={dialogOpen} onOpenChange={handleDialogClose} />
    </div>
  );
}
