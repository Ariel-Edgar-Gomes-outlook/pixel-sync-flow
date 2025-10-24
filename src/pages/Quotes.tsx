import { useState, useMemo, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Search, FileText, Calendar, Pencil, DollarSign, Send, CheckCircle, Download, CreditCard, Briefcase, Clock, Users, Receipt } from "lucide-react";
import { useQuotes, useUpdateQuote } from "@/hooks/useQuotes";
import { useCreateJob } from "@/hooks/useJobs";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useCreateInvoice } from '@/hooks/useInvoices';
import { generateInvoicePDF } from '@/lib/professionalPdfGenerator';
import { QuoteDialog } from "@/components/QuoteDialog";
import { PaymentPlanDialog } from "@/components/PaymentPlanDialog";
import { PDFViewerDialog } from '@/components/PDFViewerDialog';
import { EntityQuickLinks } from "@/components/EntityQuickLinks";
import { useSmartBadges } from "@/hooks/useSmartBadges";
import { exportToExcel, formatQuotesForExport } from "@/lib/exportUtils";
import { toast } from "sonner";

const statusConfig = {
  draft: { label: "Rascunho", variant: "secondary" as const },
  sent: { label: "Enviado", variant: "primary" as const },
  accepted: { label: "Aceite", variant: "success" as const },
  rejected: { label: "Rejeitado", variant: "destructive" as const },
};

export default function Quotes() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "value">("date");
  const [paymentPlanQuote, setPaymentPlanQuote] = useState<any>(null);
  const [paymentPlanDialogOpen, setPaymentPlanDialogOpen] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState<string>('');
  
  const { data: quotes, isLoading } = useQuotes();
  const createJob = useCreateJob();
  const updateQuote = useUpdateQuote();
  const createInvoice = useCreateInvoice();
  const { user } = useAuth();
  const { data: businessSettings } = useBusinessSettings(user?.id);

  useEffect(() => {
    const handleOpenPDFViewer = (event: any) => {
      setSelectedPdfUrl(event.detail.url);
      setPdfTitle(event.detail.title);
      setPdfViewerOpen(true);
    };

    window.addEventListener('openPDFViewer', handleOpenPDFViewer);
    return () => window.removeEventListener('openPDFViewer', handleOpenPDFViewer);
  }, []);

  const handleEdit = (quote: any) => {
    setSelectedQuote(quote);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedQuote(null);
  };

  const handleExport = () => {
    if (quotes && quotes.length > 0) {
      const formatted = formatQuotesForExport(quotes);
      exportToExcel(formatted, "orcamentos.xlsx", "Orçamentos");
      toast.success("Orçamentos exportados com sucesso!");
    }
  };

  const handleGenerateInvoice = async (quote: any) => {
    try {
      if (!businessSettings) {
        toast.error('Configure seus dados empresariais antes de criar faturas');
        return;
      }

      toast.loading('A criar fatura...');

      const prefix = businessSettings.invoice_prefix || 'FT';
      const nextNumber = businessSettings.next_invoice_number || 1;
      const invoiceNumber = `${prefix}${String(nextNumber).padStart(4, '0')}/${new Date().getFullYear()}`;

      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('id', quote.client_id)
        .single();

      if (!client) throw new Error('Cliente não encontrado');

      const invoiceData = {
        user_id: user?.id,
        client_id: quote.client_id,
        quote_id: quote.id,
        invoice_number: invoiceNumber,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: quote.items,
        subtotal: quote.total - (quote.tax || 0),
        tax_rate: 14,
        tax_amount: quote.tax || 0,
        discount_amount: quote.discount || 0,
        total: quote.total,
        currency: quote.currency || 'AOA',
        status: 'issued',
        is_proforma: false,
      };

      const newInvoice = await createInvoice.mutateAsync(invoiceData);

      const pdfUrl = await generateInvoicePDF(newInvoice, client, businessSettings);

      await supabase
        .from('invoices')
        .update({ pdf_url: pdfUrl })
        .eq('id', newInvoice.id);

      await supabase
        .from('business_settings')
        .update({ next_invoice_number: nextNumber + 1 })
        .eq('user_id', user?.id);

      toast.dismiss();
      toast.success('Fatura criada com sucesso!');
      navigate(`/invoices`);
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.dismiss();
      toast.error('Erro ao criar fatura');
    }
  };

  const handleConvertToJob = async (quote: any) => {
    try {
      let itemsDescription = '';
      if (quote.items && Array.isArray(quote.items)) {
        itemsDescription = '\n\nItens do Orçamento:\n' + 
          quote.items.map((item: any, idx: number) => 
            `${idx + 1}. ${item.description || item.name} - ${item.quantity || 1}x ${Number(item.price || 0).toFixed(2)} ${quote.currency || 'AOA'}`
          ).join('\n');
      }

      const jobData = {
        client_id: quote.client_id,
        title: `${quote.clients?.name || 'Cliente'} - ${quote.items?.[0]?.description || 'Serviço'}`,
        type: quote.items?.[0]?.category || 'Fotografia',
        status: 'confirmed' as const,
        start_datetime: new Date().toISOString(),
        estimated_revenue: quote.total,
        estimated_cost: quote.total * 0.3,
        description: `Orçamento #${quote.id.substring(0, 8)} aceito em ${new Date(quote.accepted_at).toLocaleDateString('pt-PT')}\n\nValor Total: ${Number(quote.total).toFixed(2)} ${quote.currency || 'AOA'}${itemsDescription}`,
        tags: ['orçamento-convertido'],
      };

      const newJob = await createJob.mutateAsync(jobData);

      await updateQuote.mutateAsync({
        id: quote.id,
        job_id: newJob.id,
      });

      toast.success("Job criado com sucesso!", {
        description: "Navegando para o job...",
        action: {
          label: "Ver Job",
          onClick: () => navigate('/jobs'),
        },
      });

      setTimeout(() => navigate('/jobs'), 1500);
    } catch (error: any) {
      toast.error("Erro ao converter", {
        description: error.message,
      });
    }
  };

  const filteredQuotes = useMemo(() => {
    let filtered = quotes?.filter(quote => {
      const matchesSearch = quote.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

    if (sortBy === "date") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "value") {
      filtered.sort((a, b) => Number(b.total) - Number(a.total));
    }

    return filtered;
  }, [quotes, searchQuery, statusFilter, sortBy]);

  const showEmptyState = !isLoading && (!quotes || quotes.length === 0);

  if (isLoading) {
    return <div className="space-y-6">Carregando...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Orçamentos</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Crie propostas profissionais e acompanhe aceitações de clientes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
          <QuoteDialog>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Novo Orçamento
            </Button>
          </QuoteDialog>
        </div>
      </div>

      {showEmptyState ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <FileText className="h-12 w-12 text-primary" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Comece a enviar orçamentos</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Crie orçamentos detalhados com itens, valores, impostos e descontos. 
              Acompanhe o status desde rascunho até aceitação pelo cliente.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-sm font-medium">Itemizado</div>
                <div className="text-xs text-muted-foreground text-center">
                  Liste serviços, produtos e valores
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <Send className="h-8 w-8 text-primary" />
                <div className="text-sm font-medium">Envio Profissional</div>
                <div className="text-xs text-muted-foreground text-center">
                  Gere PDF e envie ao cliente
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <CheckCircle className="h-8 w-8 text-primary" />
                <div className="text-sm font-medium">Conversão em Job</div>
                <div className="text-xs text-muted-foreground text-center">
                  Orçamento aceite vira trabalho
                </div>
              </div>
            </div>

            <QuoteDialog>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Criar Primeiro Orçamento
              </Button>
            </QuoteDialog>

            <div className="mt-8 p-4 bg-muted/30 rounded-lg max-w-2xl">
              <p className="text-sm text-muted-foreground">
                <strong>Fluxo:</strong> Lead recebe orçamento → Cliente aceita → Cria-se Job automaticamente
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="sent">Enviado</SelectItem>
                  <SelectItem value="accepted">Aceite</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Mais recentes</SelectItem>
                  <SelectItem value="value">Maior valor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredQuotes.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-1">Nenhum orçamento encontrado</p>
                <p className="text-sm">Tente ajustar os termos de pesquisa</p>
              </div>
             ) : (
              filteredQuotes.map((quote) => {
                const smartBadges = useSmartBadges({ entityType: 'quote', entity: quote });
                
                return (
                <Card
                  key={quote.id}
                  className="p-4 sm:p-5 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <FileText className="h-5 w-5 text-primary shrink-0" />
                          <h3 className="text-base sm:text-lg font-semibold truncate">
                            {quote.clients?.name || 'Cliente não especificado'}
                          </h3>
                          <Badge variant={statusConfig[quote.status as keyof typeof statusConfig]?.variant || 'secondary'}>
                            {statusConfig[quote.status as keyof typeof statusConfig]?.label || quote.status}
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
                       
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                         <div className="flex items-center gap-2 text-muted-foreground">
                           <Calendar className="h-4 w-4 shrink-0" />
                           <span className="truncate">Criado: {new Date(quote.created_at).toLocaleDateString("pt-PT")}</span>
                         </div>
                         {quote.validity_date && (
                           <div className="flex items-center gap-2 text-muted-foreground">
                             <Clock className="h-4 w-4 shrink-0" />
                             <span className="truncate">Validade: {new Date(quote.validity_date).toLocaleDateString("pt-PT")}</span>
                           </div>
                         )}
                       </div>
                     </div>
                     
                     <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                       <div className="text-right">
                         <div className="text-xl sm:text-2xl font-bold whitespace-nowrap">
                           {Number(quote.total).toFixed(2)}
                         </div>
                         <div className="text-xs text-muted-foreground">
                           {quote.currency || 'AOA'}
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="pt-2 border-t">
                      <EntityQuickLinks 
                        links={[
                          { type: 'client', id: quote.client_id, name: quote.clients?.name || 'Cliente' },
                          ...(quote.job_id ? [{ type: 'job' as const, id: quote.job_id, name: 'Job Criado', status: 'convertido' }] : []),
                        ]}
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                        {quote.pdf_url ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedPdfUrl(quote.pdf_url);
                            setPdfTitle(`Orçamento - ${quote.clients?.name || 'Cliente'}`);
                            setPdfViewerOpen(true);
                          }}
                        >
                          <FileText className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Ver PDF</span>
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          PDF ao salvar
                        </Badge>
                      )}
                     <Button 
                       variant="outline" 
                       size="sm"
                       onClick={() => handleEdit(quote)}
                     >
                       <Pencil className="h-4 w-4 sm:mr-2" />
                       <span className="hidden sm:inline">Editar</span>
                     </Button>
                     {quote.status === 'accepted' && (
                       <>
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => {
                             navigate('/invoices?from_quote=' + quote.id);
                           }}
                         >
                           <FileText className="h-4 w-4 sm:mr-2" />
                           <span className="hidden sm:inline">Fatura</span>
                         </Button>
                         {!quote.job_id && (
                           <AlertDialog>
                             <AlertDialogTrigger asChild>
                               <Button 
                                 variant="default" 
                                 size="sm"
                                 disabled={createJob.isPending}
                               >
                                 <Briefcase className="h-4 w-4 sm:mr-2" />
                                 <span className="hidden sm:inline">Job</span>
                               </Button>
                             </AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader>
                             <AlertDialogTitle>Converter Orçamento em Job?</AlertDialogTitle>
                             <AlertDialogDescription className="space-y-3">
                               <p>Será criado um novo job com os seguintes dados:</p>
                               <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                                 <div><strong>Cliente:</strong> {quote.clients?.name}</div>
                                 <div><strong>Valor:</strong> {Number(quote.total).toFixed(2)} {quote.currency || 'AOA'}</div>
                                 <div><strong>Status:</strong> Confirmado</div>
                                 {quote.items && Array.isArray(quote.items) && quote.items.length > 0 && (
                                   <div>
                                     <strong>Itens:</strong>
                                     <ul className="list-disc list-inside mt-1">
                                       {quote.items.slice(0, 3).map((item: any, idx: number) => (
                                         <li key={idx}>{item.description || item.name}</li>
                                       ))}
                                       {quote.items.length > 3 && <li>... e mais {quote.items.length - 3} itens</li>}
                                     </ul>
                                   </div>
                                 )}
                               </div>
                               <p className="text-muted-foreground">O orçamento ficará vinculado ao job criado.</p>
                             </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleConvertToJob(quote)}>
                                Confirmar Conversão
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      {quote.job_id && (
                         <Badge variant="secondary" className="gap-1">
                           <Briefcase className="h-3 w-3" />
                           Job Criado
                         </Badge>
                       )}
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => {
                           setPaymentPlanQuote(quote);
                           setPaymentPlanDialogOpen(true);
                         }}
                       >
                         <CreditCard className="h-4 w-4 sm:mr-2" />
                         <span className="hidden sm:inline">Plano</span>
                        </Button>
                      </>
                    )}
                    </div>
                  </div>
                  </div>
                </Card>
                );
              })
            )}
          </div>
        </Card>
      )}

      <QuoteDialog 
        quote={selectedQuote} 
        open={isDialogOpen} 
        onOpenChange={handleCloseDialog}
      />
      
      <PaymentPlanDialog
        quoteId={paymentPlanQuote?.id}
        totalAmount={paymentPlanQuote?.total || 0}
        open={paymentPlanDialogOpen}
        onOpenChange={setPaymentPlanDialogOpen}
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
