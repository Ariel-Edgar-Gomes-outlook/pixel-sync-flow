import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreatePaymentPlan, type PaymentInstallment } from "@/hooks/usePaymentPlans";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/hooks/useCurrency";

interface PaymentPlanDialogProps {
  jobId?: string;
  quoteId?: string;
  totalAmount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentPlanDialog({ 
  jobId, 
  quoteId, 
  totalAmount, 
  open, 
  onOpenChange 
}: PaymentPlanDialogProps) {
  const [installments, setInstallments] = useState<Partial<PaymentInstallment>[]>([
    { percentage: 30, description: "Entrada", status: "pending" },
    { percentage: 70, description: "Restante", status: "pending" },
  ]);

  const createPaymentPlan = useCreatePaymentPlan();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  const calculateAmount = (percentage: number) => {
    return (totalAmount * percentage) / 100;
  };

  const addInstallment = () => {
    setInstallments([
      ...installments,
      { percentage: 0, description: "", status: "pending" },
    ]);
  };

  const removeInstallment = (index: number) => {
    setInstallments(installments.filter((_, i) => i !== index));
  };

  const updateInstallment = (index: number, field: keyof PaymentInstallment, value: any) => {
    const updated = [...installments];
    updated[index] = { ...updated[index], [field]: value };
    setInstallments(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalPercentage = installments.reduce((sum, inst) => sum + (inst.percentage || 0), 0);
    if (totalPercentage !== 100) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A soma das parcelas deve ser 100%",
      });
      return;
    }

    const hasInvalidDate = installments.some(inst => !inst.due_date);
    if (hasInvalidDate) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Todas as parcelas devem ter uma data de vencimento",
      });
      return;
    }

    try {
      const completeInstallments: PaymentInstallment[] = installments.map(inst => ({
        percentage: inst.percentage!,
        amount: calculateAmount(inst.percentage!),
        due_date: inst.due_date!,
        description: inst.description || "",
        status: "pending",
      }));

      // Criar o plano de pagamento
      const planData = await createPaymentPlan.mutateAsync({
        job_id: jobId || null,
        quote_id: quoteId || null,
        total_amount: totalAmount,
        installments: completeInstallments as any,
      });

      // Criar automaticamente as parcelas na tabela payments
      const { data: clientData } = await supabase
        .from(jobId ? 'jobs' : 'quotes')
        .select('client_id')
        .eq('id', jobId || quoteId!)
        .single();

      if (clientData?.client_id) {
        const { data: { user } } = await supabase.auth.getUser();
        const paymentsToInsert = completeInstallments.map(inst => ({
          client_id: clientData.client_id,
          quote_id: quoteId || null,
          payment_plan_id: planData.id,
          amount: inst.amount,
          type: 'installment',
          status: 'pending' as const,
          due_date: inst.due_date,
          notes: inst.description,
          currency: 'AOA',
          created_by: user?.id,
        }));

        const { error: paymentsError } = await supabase
          .from('payments')
          .insert(paymentsToInsert);

        if (paymentsError) {
          console.error('Error creating payment installments:', paymentsError);
        }
      }

      toast({
        title: "Sucesso",
        description: `Plano criado com ${completeInstallments.length} parcelas geradas automaticamente`,
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    }
  };

  const totalPercentage = installments.reduce((sum, inst) => sum + (inst.percentage || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Plano de Pagamento Fracionado</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-2xl font-bold">
              {formatCurrency(totalAmount)}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Parcelas ({installments.length})</Label>
              <Button type="button" variant="outline" size="sm" onClick={addInstallment}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Parcela
              </Button>
            </div>

            {installments.map((inst, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Parcela {index + 1}</h4>
                  {installments.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInstallment(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Percentual (%)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={inst.percentage || ""}
                      onChange={(e) => 
                        updateInstallment(index, 'percentage', parseInt(e.target.value) || 0)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Valor Calculado</Label>
                    <Input
                      value={formatCurrency(calculateAmount(inst.percentage || 0))}
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Input
                    value={inst.description || ""}
                    onChange={(e) => updateInstallment(index, 'description', e.target.value)}
                    placeholder="Ex: Entrada, Dia do evento, Entrega final"
                    required
                  />
                </div>

                <div>
                  <Label>Data de Vencimento</Label>
                  <Input
                    type="date"
                    value={inst.due_date || ""}
                    onChange={(e) => updateInstallment(index, 'due_date', e.target.value)}
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={cn(
            "p-4 rounded-lg border",
            totalPercentage === 100 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
          )}>
            <p className="text-sm font-medium">
              Total: {totalPercentage}% 
              {totalPercentage === 100 ? " ✓" : ` (faltam ${100 - totalPercentage}%)`}
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createPaymentPlan.isPending || totalPercentage !== 100}
            >
              Criar Plano
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
