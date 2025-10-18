import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePayment, useUpdatePayment, type Payment } from "@/hooks/usePayments";
import { useClients } from "@/hooks/useClients";
import { useQuotes } from "@/hooks/useQuotes";
import { toast } from "sonner";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{payment ? "Editar Pagamento" : "Novo Pagamento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Cliente *</Label>
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
              <Label htmlFor="quote_id">Orçamento (Opcional)</Label>
              <Select
                value={formData.quote_id}
                onValueChange={(value) => setFormData({ ...formData, quote_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o orçamento" />
                </SelectTrigger>
                <SelectContent>
                  {quotes?.map((quote) => (
                    <SelectItem key={quote.id} value={quote.id}>
                      Orçamento #{quote.id.slice(0, 8)} - Kz {Number(quote.total).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (Kz) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Pagamento</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="servico">Serviço</SelectItem>
                  <SelectItem value="produto">Produto</SelectItem>
                  <SelectItem value="consultoria">Consultoria</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Método de Pagamento</Label>
              <Select
                value={formData.method}
                onValueChange={(value) => setFormData({ ...formData, method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                  <SelectItem value="multicaixa">Multicaixa</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange?.(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createPayment.isPending || updatePayment.isPending}>
              {payment ? "Atualizar" : "Criar"} Pagamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
