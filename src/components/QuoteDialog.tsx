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
import { toast } from "sonner";
import { Plus, X, FileText, Calculator, Percent, Tag } from "lucide-react";

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
  const { data: clients } = useClients();

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
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, price: 0 }]
    }));
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
    
    if (!formData.client_id) {
      toast.error("Selecione um cliente");
      return;
    }

    if (formData.items.length === 0) {
      toast.error("Adicione pelo menos um item");
      return;
    }

    const total = calculateTotal();
    const quoteData = { ...formData, total };

    try {
      if (quote) {
        await updateQuote.mutateAsync({ id: quote.id, ...quoteData });
        toast.success("Orçamento atualizado!");
      } else {
        await createQuote.mutateAsync(quoteData);
        toast.success("Orçamento criado!");
      }
      actualOnOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error("Erro ao salvar orçamento");
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

  return (
    <Dialog open={actualOpen} onOpenChange={actualOnOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="w-[95vw] sm:w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            {quote ? "Editar Orçamento" : "Novo Orçamento"}
          </DialogTitle>
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
              <Button type="button" variant="default" size="sm" onClick={addItem} className="w-full sm:w-auto">
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
