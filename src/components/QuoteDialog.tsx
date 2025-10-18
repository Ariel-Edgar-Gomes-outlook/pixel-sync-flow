import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateQuote, useUpdateQuote, Quote } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

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

  return (
    <Dialog open={actualOpen} onOpenChange={actualOnOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quote ? "Editar Orçamento" : "Novo Orçamento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente *</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validity_date">Data de Validade</Label>
              <Input
                id="validity_date"
                type="date"
                value={formData.validity_date}
                onChange={(e) => setFormData({ ...formData, validity_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Quote['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="sent">Enviado</SelectItem>
                  <SelectItem value="accepted">Aceite</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AOA">AOA - Kwanza</SelectItem>
                  <SelectItem value="USD">USD - Dólar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Items *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Item
              </Button>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Descrição"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Quantidade"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                    />
                    <Input
                      type="number"
                      placeholder="Preço"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(index, "price", Number(e.target.value))}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Subtotal: {(item.quantity * item.price).toFixed(2)} {formData.currency}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax">Taxa (%)</Label>
              <Input
                id="tax"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Desconto ({formData.currency})</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                step="0.01"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-foreground">
              Total: {calculateTotal().toFixed(2)} {formData.currency}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => actualOnOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createQuote.isPending || updateQuote.isPending}>
              {quote ? "Atualizar" : "Criar"} Orçamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
