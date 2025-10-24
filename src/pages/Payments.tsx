import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, DollarSign, Calendar, CreditCard, Edit, TrendingUp, Wallet, Receipt, Download, FileText, Users, Briefcase } from "lucide-react";
import { usePayments, type Payment } from "@/hooks/usePayments";
import PaymentDialog from "@/components/PaymentDialog";
import { PaymentReceiptDialog } from "@/components/PaymentReceiptDialog";
import { PDFViewerDialog } from '@/components/PDFViewerDialog';
import { EntityQuickLinks } from "@/components/EntityQuickLinks";
import { useSmartBadges } from "@/hooks/useSmartBadges";
import { exportToExcel, formatPaymentsForExport } from "@/lib/exportUtils";
import { toast } from "sonner";

const statusConfig = {
  pending: { label: "Pendente", variant: "warning" as const },
  paid: { label: "Pago", variant: "success" as const },
  partial: { label: "Parcial", variant: "warning" as const },
  refunded: { label: "Reembolsado", variant: "secondary" as const },
};

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState<string>('');
  const { data: payments, isLoading } = usePayments();

  useEffect(() => {
    const handleOpenPDFViewer = (event: any) => {
      setSelectedPdfUrl(event.detail.url);
      setPdfTitle(event.detail.title);
      setPdfViewerOpen(true);
    };

    window.addEventListener('openPDFViewer', handleOpenPDFViewer);
    return () => window.removeEventListener('openPDFViewer', handleOpenPDFViewer);
  }, []);

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedPayment(null);
    }
  };

  const handleNewPayment = () => {
    setSelectedPayment(null);
    setIsDialogOpen(true);
  };

  const handleExport = () => {
    if (payments && payments.length > 0) {
      const formatted = formatPaymentsForExport(payments);
      exportToExcel(formatted, "pagamentos.xlsx", "Pagamentos");
      toast.success("Pagamentos exportados com sucesso!");
    }
  };

  const filteredPayments = payments?.filter(payment =>
    payment.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const totalRevenue = payments?.filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const pendingAmount = payments?.filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  const showEmptyState = !isLoading && (!payments || payments.length === 0);

  if (isLoading) {
    return <div className="space-y-6">Carregando...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Financeiro</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Controle completo de pagamentos, receitas e fluxo de caixa
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Button className="gap-2 w-full sm:w-auto" onClick={handleNewPayment}>
            <Plus className="h-4 w-4" />
            Novo Pagamento
          </Button>
        </div>
      </div>

      {showEmptyState ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <Wallet className="h-12 w-12 text-primary" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Comece a controlar suas finanças</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Registe pagamentos recebidos, pendentes e parciais. Acompanhe receitas, 
              métodos de pagamento e gere recibos para seus clientes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div className="text-sm font-medium">Receitas</div>
                <div className="text-xs text-muted-foreground text-center">
                  Acompanhe entradas e pagamentos
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <CreditCard className="h-8 w-8 text-primary" />
                <div className="text-sm font-medium">Múltiplos Métodos</div>
                <div className="text-xs text-muted-foreground text-center">
                  Dinheiro, transferência, cartão
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <Receipt className="h-8 w-8 text-primary" />
                <div className="text-sm font-medium">Recibos</div>
                <div className="text-xs text-muted-foreground text-center">
                  Links para comprovantes
                </div>
              </div>
            </div>

            <Button size="lg" className="gap-2" onClick={handleNewPayment}>
              <Plus className="h-5 w-5" />
              Registar Primeiro Pagamento
            </Button>

            <div className="mt-8 p-4 bg-muted/30 rounded-lg max-w-2xl">
              <p className="text-sm text-muted-foreground">
                <strong>Tipos:</strong> Sinal, pagamento final, parcelas - vincule a orçamentos ou jobs existentes
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold text-foreground">Kz {totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
              <Calendar className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pendente</p>
              <p className="text-2xl font-bold text-foreground">Kz {pendingAmount.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Transações</p>
              <p className="text-2xl font-bold text-foreground">{payments?.length || 0}</p>
            </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
        <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredPayments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-1">Nenhum pagamento encontrado</p>
                <p className="text-sm">Tente ajustar os termos de pesquisa</p>
              </div>
            ) : (
            filteredPayments.map((payment) => {
              const smartBadges = useSmartBadges({ entityType: 'payment', entity: payment });
              
              return (
              <Card
                key={payment.id}
                className="p-4 sm:p-5 hover:shadow-md transition-all"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-5 w-5 text-primary shrink-0" />
                        <h3 className="text-base sm:text-lg font-semibold truncate">
                          {payment.clients?.name || 'Cliente não especificado'}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={statusConfig[payment.status as keyof typeof statusConfig]?.variant || 'secondary'}>
                          {statusConfig[payment.status as keyof typeof statusConfig]?.label || payment.status}
                        </Badge>
                        <Badge variant="outline">{payment.type}</Badge>
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
                    <div className="text-right shrink-0">
                      <div className="text-xl sm:text-2xl font-bold">
                        Kz {Number(payment.amount).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {payment.currency || 'AOA'}
                      </div>
                    </div>
                  </div>
                  
                  <EntityQuickLinks 
                    links={[
                      { type: 'client', id: payment.client_id, name: payment.clients?.name || 'Cliente' },
                      ...(payment.invoice_id ? [{ type: 'invoice' as const, id: payment.invoice_id, name: 'Fatura', status: 'vinculada' }] : []),
                    ]}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm pt-2 border-t">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {payment.paid_at 
                          ? `Pago: ${new Date(payment.paid_at).toLocaleDateString("pt-PT")}`
                          : `Criado: ${new Date(payment.created_at).toLocaleDateString("pt-PT")}`
                        }
                      </span>
                    </div>
                    {payment.method && (
                      <div className="text-muted-foreground">
                        <span>Método: {payment.method}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    {payment.receipt_link ? (
                      <>
                        <Badge variant="secondary" className="text-xs">
                          <Receipt className="h-3 w-3 mr-1" />
                          Recibo Gerado
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedPdfUrl(payment.receipt_link);
                            setPdfTitle(`Recibo - ${payment.clients?.name || 'Cliente'}`);
                            setPdfViewerOpen(true);
                          }}
                        >
                          <FileText className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Ver Recibo</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            window.open(payment.receipt_link!, '_blank');
                          }}
                        >
                          <Download className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Baixar PDF</span>
                        </Button>
                      </>
                    ) : payment.status === 'paid' && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        <Receipt className="h-3 w-3 mr-1" />
                        Sem recibo
                      </Badge>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(payment)}
                    >
                      <Edit className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                  </div>
                </div>
              </Card>
              );
            })
            )}
          </div>
        </Card>
        </>
      )}

      <PaymentDialog 
        payment={selectedPayment} 
        open={isDialogOpen} 
        onOpenChange={handleOpenChange}
      />
      
      <PaymentReceiptDialog
        open={isReceiptDialogOpen}
        onOpenChange={setIsReceiptDialogOpen}
        payment={selectedPayment}
      />

      <PDFViewerDialog
        open={pdfViewerOpen}
        onOpenChange={setPdfViewerOpen}
        pdfUrl={selectedPdfUrl}
        title={pdfTitle}
      />
    </div>
  );
}
