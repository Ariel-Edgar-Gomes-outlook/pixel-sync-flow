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

  // Alertas de pagamento
  const today = new Date();
  const overdue = payments?.filter(p => p.status === 'pending' && p.due_date && new Date(p.due_date) < today) || [];
  const upcoming = payments?.filter(p => {
    if (p.status !== 'pending' || !p.due_date) return false;
    const dueDate = new Date(p.due_date);
    const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue >= 0 && daysUntilDue <= 7;
  }) || [];

  const statusConfig = {
    paid: { icon: CheckCircle2, label: "Pago", variant: "success" as const },
    pending: { icon: Clock, label: "Pendente", variant: "warning" as const },
    partial: { icon: Clock, label: "Parcial", variant: "primary" as const },
    refunded: { icon: XCircle, label: "Reembolsado", variant: "destructive" as const },
  };

  return (
    <Card className="p-6">
      {/* Alertas */}
      {overdue.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm font-medium text-destructive">
            ⚠️ {overdue.length} pagamento(s) vencido(s)
          </p>
        </div>
      )}
      {upcoming.length > 0 && overdue.length === 0 && (
        <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
          <p className="text-sm font-medium text-warning">
            🔔 {upcoming.length} pagamento(s) vence(m) nos próximos 7 dias
          </p>
        </div>
      )}

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
          
          const dueDate = payment.due_date ? new Date(payment.due_date) : null;
          const isOverdue = payment.status === 'pending' && dueDate && dueDate < today;
          const daysUntilDue = dueDate ? Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
          const isUpcoming = payment.status === 'pending' && daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7;

          return (
            <div
              key={payment.id}
              className={`flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow ${
                isOverdue ? 'border-destructive/50 bg-destructive/5' : 
                isUpcoming ? 'border-warning/50 bg-warning/5' : ''
              }`}
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
                    {isOverdue && <span className="text-destructive font-medium ml-2">VENCIDO</span>}
                    {isUpcoming && <span className="text-warning font-medium ml-2">Vence em {daysUntilDue} dia(s)</span>}
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
