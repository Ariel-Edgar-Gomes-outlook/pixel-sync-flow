import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/hooks/useCurrency';

export function PaymentAlertsWidget() {
  const { data: invoices } = useInvoices();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  const { overdueInvoices, upcomingInvoices, totalOverdue, totalUpcoming } = useMemo(() => {
    if (!invoices) return { overdueInvoices: [], upcomingInvoices: [], totalOverdue: 0, totalUpcoming: 0 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const overdue = invoices.filter(inv => {
      if (inv.status === 'paid' || inv.status === 'cancelled' || !inv.due_date) return false;
      const dueDate = new Date(inv.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    });

    const upcoming = invoices.filter(inv => {
      if (inv.status === 'paid' || inv.status === 'cancelled' || !inv.due_date) return false;
      const dueDate = new Date(inv.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today && dueDate <= sevenDaysFromNow;
    });

    const totalOverdue = overdue.reduce((sum, inv) => sum + (inv.total - (inv.amount_paid || 0)), 0);
    const totalUpcoming = upcoming.reduce((sum, inv) => sum + (inv.total - (inv.amount_paid || 0)), 0);

    return {
      overdueInvoices: overdue.slice(0, 3),
      upcomingInvoices: upcoming.slice(0, 3),
      totalOverdue,
      totalUpcoming,
    };
  }, [invoices]);

  if (overdueInvoices.length === 0 && upcomingInvoices.length === 0) {
    return null;
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Alertas de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {overdueInvoices.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Faturas Vencidas ({overdueInvoices.length})
              </h4>
              <span className="text-sm font-bold text-destructive">
                {formatCurrency(totalOverdue)}
              </span>
            </div>
            <div className="space-y-2">
              {overdueInvoices.map((invoice) => {
                const daysOverdue = Math.floor(
                  (new Date().getTime() - new Date(invoice.due_date!).getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-destructive/5 border border-destructive/20"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{invoice.clients?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.invoice_number} • Vencida há {daysOverdue} dias
                      </p>
                    </div>
                    <Badge variant="destructive" className="ml-2">
                      {formatCurrency(invoice.total - (invoice.amount_paid || 0))}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {upcomingInvoices.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                Vencimento Próximo ({upcomingInvoices.length})
              </h4>
              <span className="text-sm font-bold text-warning">
                {formatCurrency(totalUpcoming)}
              </span>
            </div>
            <div className="space-y-2">
              {upcomingInvoices.map((invoice) => {
                const daysUntilDue = Math.ceil(
                  (new Date(invoice.due_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-warning/5 border border-warning/20"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{invoice.clients?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.invoice_number} • Vence em {daysUntilDue} dias
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2 border-warning text-warning">
                      {formatCurrency(invoice.total - (invoice.amount_paid || 0))}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={() => navigate('/dashboard/invoices')}
        >
          Ver Todas as Faturas
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
