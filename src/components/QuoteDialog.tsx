import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { useCreateQuote, useUpdateQuote, Quote } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, X, FileText, Calculator, Percent, Tag, Briefcase, FileDown, Sparkles, Send } from "lucide-react";
import { useQuoteTemplates } from "@/hooks/useTemplates";
import { useUpdateQuote as useUpdateQuoteMutation } from "@/hooks/useQuotes";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

interface QuoteDialogProps {
  children?: React.ReactNode;
  quote?: Quote & { clients?: { id: string; name: string; email: string } };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface QuoteItem {
  description: string;
  quantity: number;
  price: number;
}

export function QuoteDialog({ children, quote, open, onOpenChange }: QuoteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_id: "",
    job_id: null as string | null,
    items: [] as QuoteItem[],
    total: 0,
    tax: 0,
    discount: 0,
    validity_date: "",
    status: "draft" as Quote['status'],
    currency: "AOA",
  });

  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote();
  const updateQuoteMutation = useUpdateQuoteMutation();
  const { data: clients } = useClients();
  const { data: quoteTemplates } = useQuoteTemplates();
  const navigate = useNavigate();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const actualOpen = open !== undefined ? open : isOpen;
  const actualOnOpenChange = onOpenChange || setIsOpen;

  useEffect(() => {
    if (quote) {
      setFormData({
        client_id: quote.client_id,
        job_id: quote.job_id,
        items: Array.isArray(quote.items) ? quote.items : [],
        total: Number(quote.total),
        tax: Number(quote.tax) || 0,
        discount: Number(quote.discount) || 0,
        validity_date: quote.validity_date || "",
        status: quote.status,
        currency: quote.currency || "AOA",
      });
    }
  }, [quote]);

  const addItem = () => {
    console.log('Adding item, current items:', formData.items);
    const newItem: QuoteItem = { description: "", quantity: 1, price: 0 };
    setFormData(prev => {
      const updatedItems = [...prev.items, newItem];
      console.log('Updated items:', updatedItems);
      return {
        ...prev,
        items: updatedItems
      };
    });
    toast.success("Item adicionado! Preencha os detalhes.");
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => 
      sum + (item.quantity * item.price), 0
    );
    const taxAmount = subtotal * (formData.tax / 100);
    const total = subtotal + taxAmount - formData.discount;
    return Math.max(0, total);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations with Zod
    const quoteSchema = z.object({
      client_id: z.string().min(1, "Selecione um cliente"),
      items: z.array(z.object({
        description: z.string().min(3, "Descrição deve ter pelo menos 3 caracteres"),
        quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
        price: z.number().min(0.01, "Preço deve ser maior que 0"),
      })).min(1, "Adicione pelo menos um item"),
      validity_date: z.string().optional().refine(
        (date) => !date || new Date(date) > new Date(), 
        "Data de validade deve ser no futuro"
      ),
      total: z.number().min(0.01, "Total deve ser maior que 0"),
    });

    try {
      quoteSchema.parse({
        client_id: formData.client_id,
        items: formData.items,
        validity_date: formData.validity_date,
        total: calculateTotal(),
      });
    } catch (error: any) {
      const firstError = error.errors?.[0];
      toast.error(firstError?.message || "Erro de validação");
      return;
    }

    // Check if trying to edit accepted quote
    if (quote && quote.status === 'accepted') {
      toast.error("Não é possível editar um orçamento aceite");
      return;
    }

    // Warn about editing sent quote
    if (quote && quote.status === 'sent') {
      const confirmed = window.confirm("Este orçamento já foi enviado. Tem certeza que deseja editá-lo?");
      if (!confirmed) return;
    }

    const total = calculateTotal();
    const quoteData = { 
      ...formData, 
      total,
      // Set default validity to +30 days if not set and creating new
      validity_date: formData.validity_date || (!quote ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null),
    };

    const previousStatus = quote?.status;

    try {
      setIsGeneratingPDF(true);
      let savedQuote;
      
      if (quote) {
        savedQuote = await updateQuote.mutateAsync({ id: quote.id, ...quoteData });
        toast.success("Orçamento atualizado!");
      } else {
        savedQuote = await createQuote.mutateAsync(quoteData);
        toast.success("Orçamento criado!");
      }

      // Success - quote saved
      if (savedQuote) {
        // Auto-send email if status changed to 'sent'
        if (savedQuote.status === 'sent' && previousStatus !== 'sent') {
          try {
            await supabase.functions.invoke('send-quote-email', {
              body: { quoteId: savedQuote.id, type: 'send' },
            });
            toast.success("Email enviado ao cliente!", {
              description: "O cliente receberá o orçamento por email.",
            });
          } catch (emailError) {
            console.error('Email error:', emailError);
            toast.warning("Orçamento salvo, mas erro ao enviar email", {
              description: "Pode enviar manualmente depois.",
            });
          }
        }
      }

      actualOnOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar orçamento:", error);
      toast.error("Erro ao salvar orçamento");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: "",
      job_id: null,
      items: [],
      total: 0,
      tax: 0,
      discount: 0,
      validity_date: "",
      status: "draft",
      currency: "AOA",
    });
  };

  const subtotal = formData.items.reduce((sum, item) => 
    sum + (item.quantity * item.price), 0
  );
  const taxAmount = subtotal * (formData.tax / 100);
  const finalTotal = calculateTotal();

  const handleUseTemplate = (templateId: string) => {
    const template = quoteTemplates?.find(t => t.id === templateId);
    if (!template) return;

    setFormData(prev => ({
      ...prev,
      items: template.items || [],
      tax: Number(template.tax) || 0,
      discount: Number(template.discount) || 0,
      currency: template.currency || "AOA",
    }));
    toast.success("Template aplicado!");
  };

  const handleGeneratePDF = () => {
    if (!quote) return;

    // Dispatch event to open PDFViewerDialog with local generation
    const event = new CustomEvent('openPDFViewer', { 
      detail: { 
        pdfSource: {
          type: 'local',
          entityType: 'quote',
          entityId: quote.id
        },
        title: `Orçamento - ${quote.clients?.name || 'Cliente'}` 
      } 
    });
    window.dispatchEvent(event);
  };

  return (
    <Dialog open={actualOpen} onOpenChange={actualOnOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="w-[95vw] sm:w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              {quote ? "Editar Orçamento" : "Novo Orçamento"}
            </DialogTitle>
            <div className="flex gap-2">
              {!quote && quoteTemplates && quoteTemplates.length > 0 && (
                <Select onValueChange={handleUseTemplate}>
                  <SelectTrigger className="w-[180px]">
                    <Sparkles className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Usar Template" />
                  </SelectTrigger>
                  <SelectContent>
                    {quoteTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {quote && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePDF}
                  disabled={isGeneratingPDF}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  {isGeneratingPDF ? "Gerando..." : "Gerar PDF"}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card className="p-3 sm:p-4 bg-muted/50">
            <h3 className="text-sm font-semibold mb-3 text-foreground">Informações Básicas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client" className="text-sm font-medium">
                  Cliente <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Cliente que receberá o orçamento</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="validity_date" className="text-sm font-medium">
                  Data de Validade
                </Label>
                <Input
                  id="validity_date"
                  type="date"
                  className="bg-background"
                  value={formData.validity_date}
                  onChange={(e) => setFormData({ ...formData, validity_date: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Até quando o orçamento é válido</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">Estado do Orçamento</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Quote['status'] })}
                  disabled={quote?.status === 'accepted'}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="draft">📝 Rascunho</SelectItem>
                    <SelectItem value="sent">📤 Enviado</SelectItem>
                    <SelectItem value="accepted">✅ Aceite</SelectItem>
                    <SelectItem value="rejected">❌ Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
                {quote?.accepted_at && (
                  <p className="text-xs text-success">
                    Aceite em {new Date(quote.accepted_at).toLocaleDateString('pt-PT')}
                  </p>
                )}
                {quote?.status === 'accepted' && (
                  <p className="text-xs text-muted-foreground">
                    Orçamentos aceites não podem ser editados
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm font-medium">Moeda</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="AOA">🇦🇴 AOA - Kwanza</SelectItem>
                    <SelectItem value="USD">🇺🇸 USD - Dólar</SelectItem>
                    <SelectItem value="EUR">🇪🇺 EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Separator />

          {/* Items do Orçamento */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Items do Orçamento <span className="text-destructive">*</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Adicione os serviços ou produtos</p>
              </div>
              <Button 
                type="button" 
                variant="default" 
                size="sm" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addItem();
                }} 
                className="w-full sm:w-auto shrink-0"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Adicionar Item</span>
                <span className="sm:hidden">Adicionar</span>
              </Button>
            </div>

            {formData.items.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum item adicionado</p>
                <p className="text-xs text-muted-foreground mt-1">Clique em "Adicionar Item" para começar</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                <Card key={index} className="p-3 sm:p-4 bg-card hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1">Descrição do Item</Label>
                          <Input
                            placeholder="Ex: Desenvolvimento de Website"
                            className="bg-background"
                            value={item.description}
                            onChange={(e) => updateItem(index, "description", e.target.value)}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1">Quantidade</Label>
                            <Input
                              type="number"
                              placeholder="1"
                              className="bg-background"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1">
                              Preço Unitário ({formData.currency})
                            </Label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              className="bg-background"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => updateItem(index, "price", Number(e.target.value))}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs text-muted-foreground">Subtotal do Item:</span>
                          <span className="text-sm font-semibold text-foreground">
                            {(item.quantity * item.price).toFixed(2)} {formData.currency}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="shrink-0 w-full sm:w-auto sm:size-auto"
                        onClick={() => removeItem(index)}
                      >
                        <X className="h-4 w-4 sm:mr-0" />
                        <span className="sm:hidden ml-2">Remover</span>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Ajustes Financeiros */}
          <Card className="p-3 sm:p-4 bg-muted/50">
            <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Ajustes Financeiros
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax" className="text-sm font-medium flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  Taxa / Imposto (%)
                </Label>
                <Input
                  id="tax"
                  type="number"
                  className="bg-background"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  Ex: IVA, impostos aplicáveis
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount" className="text-sm font-medium flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Desconto ({formData.currency})
                </Label>
                <Input
                  id="discount"
                  type="number"
                  className="bg-background"
                  min="0"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  Desconto em valor fixo
                </p>
              </div>
            </div>
          </Card>

          {/* Resumo de Cálculo */}
          <Card className="p-3 sm:p-5 bg-primary/5 border-primary/20">
            <h3 className="text-sm font-semibold mb-4 text-foreground">Resumo do Orçamento</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal dos Items:</span>
                <span className="font-medium">{subtotal.toFixed(2)} {formData.currency}</span>
              </div>
              
              {formData.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa ({formData.tax}%):</span>
                  <span className="font-medium text-orange-600">+ {taxAmount.toFixed(2)} {formData.currency}</span>
                </div>
              )}
              
              {formData.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Desconto:</span>
                  <span className="font-medium text-green-600">- {formData.discount.toFixed(2)} {formData.currency}</span>
                </div>
              )}
              
              <Separator className="my-2" />
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-semibold text-foreground">Total Final:</span>
                <span className="text-2xl font-bold text-primary">
                  {finalTotal.toFixed(2)} {formData.currency}
                </span>
              </div>
            </div>
          </Card>

          {/* Ação Rápida */}
          {quote && formData.status === "accepted" && (
            <Card className="p-4 bg-primary/10 border-primary/30">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Orçamento Aceite! 🎉</p>
                    <p className="text-xs text-muted-foreground">Converta em Job para começar a produção</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => {
                    actualOnOpenChange(false);
                    navigate('/jobs');
                    toast.success('Crie um job baseado neste orçamento');
                  }}
                >
                  Converter em Job
                </Button>
              </div>
            </Card>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => actualOnOpenChange(false)}
              disabled={createQuote.isPending || updateQuote.isPending}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createQuote.isPending || updateQuote.isPending}
              className="w-full sm:w-auto sm:min-w-32"
            >
              {createQuote.isPending || updateQuote.isPending ? "A guardar..." : quote ? "Atualizar Orçamento" : "Criar Orçamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
