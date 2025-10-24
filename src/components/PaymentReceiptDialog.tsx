import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreatePayment, useUpdatePayment } from '@/hooks/usePayments';
import { useInvoices, useUpdateInvoice } from '@/hooks/useInvoices';
import { toast } from 'sonner';
import { Receipt } from 'lucide-react';

const paymentSchema = z.object({
  invoice_id: z.string().min(1, 'Fatura é obrigatória'),
  client_id: z.string().min(1, 'Cliente é obrigatório'),
  amount: z.number().min(0.01, 'Valor deve ser maior que 0'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  method: z.string().optional(),
  paid_at: z.string(),
  notes: z.string().optional(),
  receipt_url: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentReceiptDialogProps {
  payment?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentReceiptDialog({ payment, open, onOpenChange }: PaymentReceiptDialogProps) {
  const { data: invoices } = useInvoices();
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const updateInvoice = useUpdateInvoice();
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoice_id: '',
      client_id: '',
      amount: 0,
      type: 'fatura',
      method: '',
      paid_at: new Date().toISOString().split('T')[0],
      notes: '',
      receipt_url: '',
    },
  });

  const selectedInvoiceId = form.watch('invoice_id');
  const selectedInvoice = invoices?.find(inv => inv.id === selectedInvoiceId);

  useEffect(() => {
    if (payment) {
      form.reset({
        invoice_id: payment.invoice_id || '',
        client_id: payment.client_id,
        amount: payment.amount,
        type: payment.type,
        method: payment.method || '',
        paid_at: payment.paid_at ? payment.paid_at.split('T')[0] : new Date().toISOString().split('T')[0],
        notes: payment.notes || '',
        receipt_url: payment.receipt_url || '',
      });
    }
  }, [payment, form]);

  useEffect(() => {
    if (selectedInvoice) {
      form.setValue('client_id', selectedInvoice.client_id);
      const remainingAmount = selectedInvoice.total - (selectedInvoice.amount_paid || 0);
      form.setValue('amount', remainingAmount);
    }
  }, [selectedInvoice, form]);

  const pendingInvoices = invoices?.filter(
    inv => inv.status === 'issued' || inv.status === 'partial' || inv.status === 'overdue'
  );

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      const paymentData = {
        ...data,
        status: 'paid' as const,
        paid_at: new Date(data.paid_at).toISOString(),
      };

      let savedPayment;
      if (payment) {
        savedPayment = await updatePayment.mutateAsync({ id: payment.id, ...paymentData });
      } else {
        savedPayment = await createPayment.mutateAsync(paymentData);
      }

      // Update invoice amount_paid - handle both new and edited payments
      if (selectedInvoice) {
        const oldPaymentAmount = payment ? (payment.amount || 0) : 0;
        const newAmountPaid = (selectedInvoice.amount_paid || 0) - oldPaymentAmount + data.amount;
        const newStatus = newAmountPaid >= selectedInvoice.total ? 'paid' : 'partial';

        await updateInvoice.mutateAsync({
          id: selectedInvoice.id,
          amount_paid: newAmountPaid,
          status: newStatus,
        });

        // Success message
        if (!payment) {
          toast.success('Pagamento registado com sucesso!', {
            description: 'Use o botão "Ver Recibo" para gerar o recibo em PDF'
          });
        } else {
          toast.success('Pagamento atualizado com sucesso!');
        }
      }

      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error('Error submitting payment:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {payment ? 'Editar Pagamento' : 'Registar Pagamento'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="invoice_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fatura *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar fatura pendente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pendingInvoices?.map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.invoice_number} - {invoice.clients?.name} - {Number(invoice.total - (invoice.amount_paid || 0)).toFixed(2)} AOA pendente
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedInvoice && (
              <div className="p-3 sm:p-4 bg-muted rounded-lg text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total da Fatura:</span>
                  <span className="font-semibold">{Number(selectedInvoice.total).toFixed(2)} AOA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Já Pago:</span>
                  <span>{Number(selectedInvoice.amount_paid || 0).toFixed(2)} AOA</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="text-muted-foreground">Valor Restante:</span>
                  <span className="font-bold text-primary">
                    {Number(selectedInvoice.total - (selectedInvoice.amount_paid || 0)).toFixed(2)} AOA
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Pago (AOA) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paid_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Pagamento *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fatura">Fatura</SelectItem>
                        <SelectItem value="adiantamento">Adiantamento</SelectItem>
                        <SelectItem value="sinal">Sinal</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="multicaixa">Multicaixa</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createPayment.isPending || updatePayment.isPending || isGeneratingReceipt}
              >
                {isGeneratingReceipt ? 'Gerando Recibo...' : payment ? 'Atualizar' : 'Registar Pagamento'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
