import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { useCreatePayment, useUpdatePayment, type Payment } from "@/hooks/usePayments";
import { useClients } from "@/hooks/useClients";
import { useQuotes } from "@/hooks/useQuotes";
import { toast } from "sonner";
import { Wallet, DollarSign, FileText, CreditCard, User } from "lucide-react";

interface PaymentDialogProps {
  payment?: Payment | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export default function PaymentDialog({ payment, open, onOpenChange, children }: PaymentDialogProps) {
  const [formData, setFormData] = useState<{
    client_id: string;
    quote_id: string;
    amount: string;
    type: string;
    status: 'pending' | 'paid' | 'partial' | 'refunded';
    method: string;
    currency: string;
    notes: string;
  }>({
    client_id: "",
    quote_id: "",
    amount: "",
    type: "servico",
    status: "pending",
    method: "",
    currency: "AOA",
    notes: "",
  });

  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const { data: clients } = useClients();
  const { data: quotes } = useQuotes();

  useEffect(() => {
    if (payment) {
      setFormData({
        client_id: payment.client_id || "",
        quote_id: payment.quote_id || "",
        amount: payment.amount?.toString() || "",
        type: payment.type || "servico",
        status: payment.status || "pending",
        method: payment.method || "",
        currency: payment.currency || "AOA",
        notes: payment.notes || "",
      });
    } else {
      resetForm();
    }
  }, [payment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_id || !formData.amount) {
      toast.error("Cliente e valor são obrigatórios");
      return;
    }

    try {
      const paymentData = {
        client_id: formData.client_id,
        quote_id: formData.quote_id || null,
        amount: parseFloat(formData.amount),
        type: formData.type,
        status: formData.status,
        method: formData.method || null,
        currency: formData.currency,
        notes: formData.notes || null,
        paid_at: formData.status === 'paid' ? new Date().toISOString() : null,
      };

      if (payment) {
        await updatePayment.mutateAsync({ id: payment.id, ...paymentData });
        toast.success("Pagamento atualizado com sucesso!");
      } else {
        await createPayment.mutateAsync(paymentData);
        toast.success("Pagamento criado com sucesso!");
      }

      resetForm();
      onOpenChange?.(false);
    } catch (error) {
      toast.error("Erro ao salvar pagamento");
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: "",
      quote_id: "",
      amount: "",
      type: "servico",
      status: "pending",
      method: "",
      currency: "AOA",
      notes: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'pending': return 'text-orange-600';
      case 'partial': return 'text-blue-600';
      case 'refunded': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return '✅ Pago';
      case 'pending': return '⏳ Pendente';
      case 'partial': return '📊 Parcial';
      case 'refunded': return '↩️ Reembolsado';
      default: return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="w-[95vw] sm:w-full max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            {payment ? "Editar Pagamento" : "Novo Pagamento"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Valor do Pagamento - Destaque */}
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <Label htmlFor="amount" className="text-base font-semibold">
                Valor do Pagamento <span className="text-destructive">*</span>
              </Label>
            </div>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.01"
                className="text-xl sm:text-2xl font-bold h-12 sm:h-14 bg-background pr-16 sm:pr-20"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
              <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-lg sm:text-xl font-semibold text-muted-foreground">
                {formData.currency}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Digite o valor que está sendo recebido ou pago
            </p>
          </Card>

          <Separator />

          {/* Cliente e Orçamento */}
          <Card className="p-3 sm:p-4 bg-muted/50">
            <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Informações do Cliente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_id" className="text-sm font-medium">
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
                <p className="text-xs text-muted-foreground">Quem está fazendo o pagamento</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quote_id" className="text-sm font-medium">
                  Orçamento Relacionado (Opcional)
                </Label>
                <Select
                  value={formData.quote_id || "none"}
                  onValueChange={(value) => setFormData({ ...formData, quote_id: value === "none" ? "" : value })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Sem orçamento" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="none">Nenhum</SelectItem>
                    {quotes?.map((quote) => (
                      <SelectItem key={quote.id} value={quote.id}>
                        #{quote.id.slice(0, 8)} - {Number(quote.total).toFixed(2)} {quote.currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Vincule a um orçamento se aplicável</p>
              </div>
            </div>
          </Card>

          {/* Tipo e Estado */}
          <Card className="p-3 sm:p-4 bg-muted/50">
            <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Classificação do Pagamento
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium">Tipo de Pagamento</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="servico">🛠️ Serviço</SelectItem>
                    <SelectItem value="produto">📦 Produto</SelectItem>
                    <SelectItem value="consultoria">💼 Consultoria</SelectItem>
                    <SelectItem value="manutencao">🔧 Manutenção</SelectItem>
                    <SelectItem value="outro">📌 Outro</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Categoria do serviço/produto</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">Estado do Pagamento</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="pending">⏳ Pendente (Aguardando)</SelectItem>
                    <SelectItem value="paid">✅ Pago (Confirmado)</SelectItem>
                    <SelectItem value="partial">📊 Parcial (Parte paga)</SelectItem>
                    <SelectItem value="refunded">↩️ Reembolsado (Devolvido)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Situação atual do pagamento
                </p>
              </div>
            </div>
          </Card>

          {/* Método de Pagamento */}
          <Card className="p-3 sm:p-4 bg-muted/50">
            <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Método de Pagamento
            </h3>
            <div className="space-y-2">
              <Label htmlFor="method" className="text-sm font-medium">Como foi/será pago?</Label>
              <Select
                value={formData.method}
                onValueChange={(value) => setFormData({ ...formData, method: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione o método de pagamento" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="transferencia">🏦 Transferência Bancária</SelectItem>
                  <SelectItem value="multicaixa">💳 Multicaixa Express</SelectItem>
                  <SelectItem value="dinheiro">💵 Dinheiro (Cash)</SelectItem>
                  <SelectItem value="cheque">📝 Cheque</SelectItem>
                  <SelectItem value="cartao">💳 Cartão de Crédito/Débito</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Forma de pagamento utilizada
              </p>
            </div>
          </Card>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              className="bg-background min-h-20"
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Adicione informações adicionais sobre o pagamento..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Notas internas, referências ou detalhes importantes
            </p>
          </div>

          {/* Resumo Visual */}
          {formData.amount && (
            <Card className="p-3 sm:p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resumo do Pagamento</p>
                  <p className={`text-sm font-medium mt-1 ${getStatusColor(formData.status)}`}>
                    {getStatusLabel(formData.status)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-xl sm:text-2xl font-bold text-primary">
                    {Number(formData.amount).toFixed(2)} {formData.currency}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange?.(false);
              }}
              disabled={createPayment.isPending || updatePayment.isPending}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createPayment.isPending || updatePayment.isPending}
              className="w-full sm:w-auto sm:min-w-32"
            >
              {createPayment.isPending || updatePayment.isPending ? "A guardar..." : payment ? "Atualizar Pagamento" : "Criar Pagamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
