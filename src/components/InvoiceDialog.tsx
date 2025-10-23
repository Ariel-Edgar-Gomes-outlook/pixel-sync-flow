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
import { useClients } from '@/hooks/useClients';
import { useCreateInvoice, useUpdateInvoice } from '@/hooks/useInvoices';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useAuth } from '@/contexts/AuthContext';
import { generateInvoicePDF } from '@/lib/professionalPdfGenerator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, FileText } from 'lucide-react';

const invoiceSchema = z.object({
  client_id: z.string().min(1, 'Cliente é obrigatório'),
  is_proforma: z.boolean(),
  issue_date: z.string(),
  due_date: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, 'Descrição é obrigatória'),
    quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
    unit_price: z.number().min(0, 'Preço deve ser maior ou igual a 0'),
    total: z.number(),
  })).min(1, 'Adicione pelo menos um item'),
  discount_amount: z.number().min(0).default(0),
  tax_rate: z.number().default(14),
  currency: z.string().default('AOA'),
  notes: z.string().optional(),
  payment_instructions: z.string().optional(),
  status: z.enum(['issued', 'paid', 'overdue', 'cancelled', 'partial']).default('issued'),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceDialogProps {
  invoice?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceDialog({ invoice, open, onOpenChange }: InvoiceDialogProps) {
  const { user } = useAuth();
  const { data: clients } = useClients();
  const { data: businessSettings } = useBusinessSettings(user?.id);
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      client_id: '',
      is_proforma: false,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: '',
      items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }],
      discount_amount: 0,
      tax_rate: 14,
      currency: 'AOA',
      notes: '',
      payment_instructions: businessSettings?.payment_terms || '',
      status: 'issued',
    },
  });

  useEffect(() => {
    if (invoice) {
      form.reset({
        client_id: invoice.client_id,
        is_proforma: invoice.is_proforma,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date || '',
        items: invoice.items,
        discount_amount: invoice.discount_amount,
        tax_rate: invoice.tax_rate,
        currency: invoice.currency,
        notes: invoice.notes || '',
        payment_instructions: invoice.payment_instructions || '',
        status: invoice.status,
      });
    }
  }, [invoice, form]);

  const items = form.watch('items');
  const discountAmount = form.watch('discount_amount');
  const taxRate = form.watch('tax_rate');

  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const addItem = () => {
    const currentItems = form.getValues('items');
    form.setValue('items', [
      ...currentItems,
      { description: '', quantity: 1, unit_price: 0, total: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues('items');
    if (currentItems.length > 1) {
      form.setValue('items', currentItems.filter((_, i) => i !== index));
    }
  };

  const updateItemTotal = (index: number) => {
    const items = form.getValues('items');
    const item = items[index];
    const total = item.quantity * item.unit_price;
    form.setValue(`items.${index}.total`, total);
  };

  const getNextInvoiceNumber = async (isProforma: boolean): Promise<string> => {
    if (!businessSettings) throw new Error('Configurações empresariais não encontradas');
    
    const prefix = isProforma ? businessSettings.proforma_prefix : businessSettings.invoice_prefix;
    const nextNumber = isProforma ? businessSettings.next_proforma_number : businessSettings.next_invoice_number;
    const year = new Date().getFullYear();
    
    return `${prefix}${year}${String(nextNumber).padStart(3, '0')}`;
  };

  const handleGeneratePDF = async (invoiceData: any) => {
    if (!businessSettings || !user) return;

    setIsGeneratingPDF(true);
    try {
      const client = clients?.find(c => c.id === invoiceData.client_id);
      if (!client) throw new Error('Cliente não encontrado');

      const pdfUrl = await generateInvoicePDF(invoiceData, client, businessSettings);
      
      toast.success('PDF gerado com sucesso!');
      window.open(pdfUrl, '_blank');
      
      return pdfUrl;
    } catch (error: any) {
      toast.error('Erro ao gerar PDF: ' + error.message);
      return null;
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const onSubmit = async (data: InvoiceFormValues) => {
    try {
      if (!user) {
        toast.error('Utilizador não autenticado');
        return;
      }

      // Validate business settings before proceeding
      if (!businessSettings) {
        toast.error('Por favor, configure seus dados empresariais antes de criar faturas', {
          description: 'Acesse Configurações > Dados da Empresa'
        });
        return;
      }

      const invoiceNumber = invoice 
        ? invoice.invoice_number 
        : await getNextInvoiceNumber(data.is_proforma);

      const invoiceData = {
        ...data,
        user_id: user.id,
        invoice_number: invoiceNumber,
        subtotal,
        tax_amount: taxAmount,
        total,
      };

      if (invoice) {
        await updateInvoice.mutateAsync({ id: invoice.id, ...invoiceData });
      } else {
        const newInvoice = await createInvoice.mutateAsync(invoiceData);
        
        // Increment invoice number in business_settings
        if (businessSettings) {
          const field = data.is_proforma ? 'next_proforma_number' : 'next_invoice_number';
          const nextNumber = data.is_proforma 
            ? businessSettings.next_proforma_number + 1 
            : businessSettings.next_invoice_number + 1;
          
          await supabase
            .from('business_settings')
            .update({ [field]: nextNumber })
            .eq('user_id', user.id);
        }
        
        // Generate PDF after creating
        const pdfUrl = await handleGeneratePDF({ ...newInvoice, ...invoiceData });
        
        if (pdfUrl) {
          await updateInvoice.mutateAsync({ id: newInvoice.id, pdf_url: pdfUrl });
        }
      }

      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error('Error submitting invoice:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>
            {invoice ? 'Editar Fatura' : 'Nova Fatura'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_proforma"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === 'true')}
                      value={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="false">Fatura Oficial</SelectItem>
                        <SelectItem value="true">Pro-Forma</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="issue_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Emissão *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Vencimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Itens *</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="w-full">
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Descrição" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Qtd"
                              {...field}
                              onChange={(e) => {
                                field.onChange(Number(e.target.value));
                                updateItemTotal(index);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.unit_price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Preço"
                              {...field}
                              onChange={(e) => {
                                field.onChange(Number(e.target.value));
                                updateItemTotal(index);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Input
                      type="number"
                      value={item.total.toFixed(2)}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span className="sm:inline">Remover</span>
                  </Button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discount_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desconto (AOA)</FormLabel>
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
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa IVA (%)</FormLabel>
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
            </div>

            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">{subtotal.toFixed(2)} AOA</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Desconto:</span>
                  <span>-{discountAmount.toFixed(2)} AOA</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>IVA ({taxRate}%):</span>
                <span>{taxAmount.toFixed(2)} AOA</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span>{total.toFixed(2)} AOA</span>
              </div>
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

            <FormField
              control={form.control}
              name="payment_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instruções de Pagamento</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
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
              {invoice && (
              <Button
                type="button"
                variant="outline"
                disabled={isGeneratingPDF}
                onClick={async () => {
                  setIsGeneratingPDF(true);
                  try {
                    const pdfUrl = await handleGeneratePDF(invoice);
                    if (pdfUrl) {
                      await updateInvoice.mutateAsync({ id: invoice.id, pdf_url: pdfUrl });
                      toast.success('PDF regenerado com sucesso!');
                    }
                  } catch (error) {
                    console.error('Error regenerating PDF:', error);
                    toast.error('Erro ao regenerar PDF');
                  } finally {
                    setIsGeneratingPDF(false);
                  }
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Regenerar PDF
              </Button>
              )}
              <Button
                type="submit"
                disabled={createInvoice.isPending || updateInvoice.isPending || isGeneratingPDF}
              >
                {invoice ? 'Atualizar' : 'Criar Fatura'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
