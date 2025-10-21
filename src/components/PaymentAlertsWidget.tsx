import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePayments } from "@/hooks/usePayments";
import { AlertTriangle, Clock, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

interface Client {
  name: string;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  due_date: string | null;
  clients?: Client;
}

export function PaymentAlertsWidget() {
  const { data: payments } = usePayments();

  const today = new Date();
  
  // Pagamentos vencidos
  const overduePayments = payments?.filter(
    p => p.status === 'pending' && p.due_date && new Date(p.due_date) < today
  ) || [];

  // Pagamentos vencendo nos próximos 7 dias
  const upcomingPayments = payments?.filter(p => {
    if (p.status !== 'pending' || !p.due_date) return false;
    const dueDate = new Date(p.due_date);
    const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue >= 0 && daysUntilDue <= 7;
  }) || [];

  const totalOverdue = overduePayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalUpcoming = upcomingPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  // Não mostrar se não houver alertas
  if (overduePayments.length === 0 && upcomingPayments.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <DollarSign className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Alertas de Pagamento</h2>
      </div>

      <div className="space-y-4">
        {/* Pagamentos Vencidos */}
        {overduePayments.length > 0 && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-destructive mb-1">
                  {overduePayments.length} Pagamento(s) Vencido(s)
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  Total: {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(totalOverdue)}
                </p>
                <div className="space-y-2">
                  {overduePayments.slice(0, 3).map(payment => {
                    const daysOverdue = Math.floor((today.getTime() - new Date(payment.due_date!).getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={payment.id} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">
                          {payment.clients?.name} - {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(Number(payment.amount))}
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          {daysOverdue} dia(s) atrás
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagamentos Próximos */}
        {upcomingPayments.length > 0 && (
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-warning mb-1">
                  {upcomingPayments.length} Pagamento(s) Vencendo em Breve
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  Total: {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(totalUpcoming)}
                </p>
                <div className="space-y-2">
                  {upcomingPayments.slice(0, 3).map(payment => {
                    const daysUntilDue = Math.floor((new Date(payment.due_date!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={payment.id} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">
                          {payment.clients?.name} - {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(Number(payment.amount))}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {daysUntilDue} dia(s)
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <Button asChild className="w-full" variant="outline">
          <Link to="/payments">Ver Todos os Pagamentos</Link>
        </Button>
      </div>
    </Card>
  );
}
