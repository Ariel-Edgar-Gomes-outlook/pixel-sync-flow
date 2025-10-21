import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface JobStatusChartProps {
  jobs: any[];
}

const STATUS_COLORS = {
  scheduled: 'hsl(var(--primary))',
  confirmed: 'hsl(var(--success))',
  in_production: 'hsl(var(--warning))',
  delivery_pending: 'hsl(var(--info))',
  completed: 'hsl(var(--accent))',
  cancelled: 'hsl(var(--destructive))',
};

const STATUS_LABELS = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  in_production: 'Em Produção',
  delivery_pending: 'Pendente Entrega',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export function JobStatusChart({ jobs }: JobStatusChartProps) {
  const statusCounts = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status,
    value: count,
    color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'hsl(var(--muted))',
  }));

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Distribuição de Jobs por Estado</h3>
        <p className="text-sm text-muted-foreground">Visão geral do status dos projetos</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
