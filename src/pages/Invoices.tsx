import { useState, useEffect } from 'react';
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
import { PDFViewerDialog } from '@/components/PDFViewerDialog';
import { InvoiceCard } from '@/components/InvoiceCard';
import { EntityQuickLinks } from '@/components/EntityQuickLinks';
import { useInvoices, useInvoiceStats, useUpdateInvoice, useDeleteInvoice } from '@/hooks/useInvoices';
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
  Users,
  Briefcase,
  Receipt,
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
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedPdfSource, setSelectedPdfSource] = useState<any>(null);

  const { data: invoices, isLoading } = useInvoices();
  const { data: stats } = useInvoiceStats();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();

  useEffect(() => {
    const handleOpenPDFViewer = (event: any) => {
      if (event.detail.pdfSource) {
        setSelectedPdfSource(event.detail.pdfSource);
      } else if (event.detail.url) {
        setSelectedPdfSource({ type: 'url', url: event.detail.url });
      }
      setPdfViewerOpen(true);
    };

    window.addEventListener('openPDFViewer', handleOpenPDFViewer);
    return () => window.removeEventListener('openPDFViewer', handleOpenPDFViewer);
  }, []);

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
    setSelectedPdfSource({
      type: 'local',
      entityType: 'invoice',
      entityId: invoice.id
    });
    setPdfViewerOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteInvoice.mutateAsync(id);
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
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-8">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Receipt className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary">Faturação</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Faturas</h1>
            <p className="text-muted-foreground">Gestão completa de faturação</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Fatura
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          <Card className="border-success/20 bg-gradient-to-br from-success/10 to-card hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Faturado</CardTitle>
              <div className="p-2 rounded-lg bg-success/10">
                <DollarSign className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {stats.totalInvoiced.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} AOA
              </div>
              <p className="text-xs text-muted-foreground">{stats.invoiceCount} faturas</p>
            </CardContent>
          </Card>

          <Card className="border-warning/20 bg-gradient-to-br from-warning/10 to-card hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendente</CardTitle>
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-4 w-4 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {stats.totalPending.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} AOA
              </div>
              <p className="text-xs text-muted-foreground">{stats.pendingCount} faturas</p>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 bg-gradient-to-br from-destructive/10 to-card hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencido</CardTitle>
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stats.totalOverdue.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} AOA
              </div>
              <p className="text-xs text-muted-foreground">{stats.overdueCount} faturas</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-card hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pago</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {stats.totalPaid.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} AOA
              </div>
              <p className="text-xs text-muted-foreground">{stats.paidCount} faturas</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
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
          {filteredInvoices.map((invoice: any) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              statusConfig={statusConfig}
              onViewPDF={handleViewPDF}
              onEdit={handleEdit}
              onUpdateStatus={(id, status) => {
                if (status === 'paid') {
                  handleMarkAsPaid(invoice);
                } else if (status === 'cancelled') {
                  handleCancel(invoice);
                } else if (status === 'overdue') {
                  updateInvoice.mutate({
                    id,
                    status: 'overdue' as any,
                  });
                }
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <InvoiceDialog invoice={selectedInvoice} open={dialogOpen} onOpenChange={handleDialogClose} />

      <PDFViewerDialog
        open={pdfViewerOpen}
        onOpenChange={setPdfViewerOpen}
        pdfSource={selectedPdfSource}
      />
    </div>
  );
}
