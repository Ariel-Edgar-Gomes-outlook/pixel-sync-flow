import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCurrency } from '@/hooks/useCurrency';

interface RevenueChartProps {
  payments: any[];
}

export function RevenueChart({ payments }: RevenueChartProps) {
  const { formatCurrency } = useCurrency();
  const last6Months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date(),
  });

  const chartData = last6Months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthPayments = payments.filter(payment => {
      const paidDate = payment.paid_at ? new Date(payment.paid_at) : null;
      return paidDate && paidDate >= monthStart && paidDate <= monthEnd && payment.status === 'paid';
    });

    const received = monthPayments
      .filter(p => p.type === 'received')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    
    const paid = monthPayments
      .filter(p => p.type === 'paid')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    return {
      month: format(month, 'MMM', { locale: ptBR }),
      recebido: received,
      pago: paid,
      lucro: received - paid,
    };
  });

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Receitas dos Últimos 6 Meses</h3>
        <p className="text-sm text-muted-foreground">Comparação de valores recebidos vs pagos</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="month" 
            className="text-xs"
            tick={{ fill: 'hsl(var(--foreground))' }}
          />
          <YAxis 
            className="text-xs"
            tick={{ fill: 'hsl(var(--foreground))' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Legend />
          <Bar dataKey="recebido" fill="hsl(var(--primary))" name="Recebido" />
          <Bar dataKey="pago" fill="hsl(var(--destructive))" name="Pago" />
          <Bar dataKey="lucro" fill="hsl(var(--success))" name="Lucro" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
