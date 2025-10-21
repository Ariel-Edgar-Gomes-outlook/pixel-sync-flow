import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle, Calendar } from "lucide-react";
import { usePaymentPlans } from "@/hooks/usePaymentPlans";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PaymentPlanViewerProps {
  jobId?: string;
  quoteId?: string;
}

export function PaymentPlanViewer({ jobId, quoteId }: PaymentPlanViewerProps) {
  const { data: plans, isLoading } = usePaymentPlans(jobId, quoteId);

  const { data: payments } = useQuery({
    queryKey: ['plan-payments', plans?.[0]?.id],
    queryFn: async () => {
      if (!plans?.[0]?.id) return [];
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('payment_plan_id', plans[0].id)
        .order('due_date');
      
      if (error) throw error;
      return data;
    },
    enabled: !!plans?.[0]?.id,
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando...</div>;
  }

  if (!plans || plans.length === 0) {
    return null;
  }

  const plan = plans[0];
  const totalPaid = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const progressPercentage = (totalPaid / Number(plan.total_amount)) * 100;

  const statusConfig = {
    paid: { icon: CheckCircle2, label: "Pago", variant: "success" as const },
    pending: { icon: Clock, label: "Pendente", variant: "warning" as const },
    partial: { icon: Clock, label: "Parcial", variant: "primary" as const },
    refunded: { icon: XCircle, label: "Reembolsado", variant: "destructive" as const },
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Plano de Pagamento Fracionado</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Pago: {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(totalPaid)}
          </span>
          <span className="text-sm font-medium">
            Total: {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(Number(plan.total_amount))}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-500"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1 text-right">
          {progressPercentage.toFixed(0)}% pago
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Parcelas</h4>
        {payments?.map((payment, index) => {
          const StatusIcon = statusConfig[payment.status as keyof typeof statusConfig]?.icon || Clock;
          const config = statusConfig[payment.status as keyof typeof statusConfig] || statusConfig.pending;

          return (
            <div
              key={payment.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <span className="text-xs font-semibold">{index + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{payment.notes || `Parcela ${index + 1}`}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Vencimento: {new Date(payment.due_date!).toLocaleDateString('pt-PT')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">
                  {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(Number(payment.amount))}
                </span>
                <Badge variant={config.variant}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
