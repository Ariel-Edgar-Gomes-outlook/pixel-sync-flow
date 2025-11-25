import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useJobs } from "@/hooks/useJobs";
import { usePayments } from "@/hooks/usePayments";
import { useLeads } from "@/hooks/useLeads";
import { useClients } from "@/hooks/useClients";
import { useQuotes } from "@/hooks/useQuotes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, DollarSign, Briefcase, Users, Target, Calendar, Download, BarChart3 } from "lucide-react";
import { useState } from "react";
import { startOfMonth, endOfMonth, eachMonthOfInterval, format, subMonths, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { 
  exportToExcel, 
  exportMultipleSheets,
  formatClientsForExport,
  formatJobsForExport,
  formatPaymentsForExport,
  formatLeadsForExport,
  formatQuotesForExport
} from "@/lib/exportUtils";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/useCurrency";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57'];

export default function Reports() {
  const [period, setPeriod] = useState("6");
  const { data: jobs } = useJobs();
  const { data: payments } = usePayments();
  const { data: leads } = useLeads();
  const { data: clients } = useClients();
  const { data: quotes } = useQuotes();
  const { formatCurrency } = useCurrency();

  const handleExportAll = () => {
    if (!clients || !jobs || !payments || !leads || !quotes) {
      toast.error('Dados não carregados ainda');
      return;
    }

    const sheets = [
      { name: 'Clientes', data: formatClientsForExport(clients) },
      { name: 'Jobs', data: formatJobsForExport(jobs) },
      { name: 'Pagamentos', data: formatPaymentsForExport(payments) },
      { name: 'Leads', data: formatLeadsForExport(leads) },
      { name: 'Orçamentos', data: formatQuotesForExport(quotes) },
    ];

    exportMultipleSheets(sheets, `Relatorio_Completo_${format(new Date(), 'yyyy-MM-dd')}`);
    toast.success('Relatório exportado com sucesso!');
  };

  const handleExportClients = () => {
    if (!clients) return;
    exportToExcel(formatClientsForExport(clients), `Clientes_${format(new Date(), 'yyyy-MM-dd')}`, 'Clientes');
    toast.success('Clientes exportados!');
  };

  const handleExportJobs = () => {
    if (!jobs) return;
    exportToExcel(formatJobsForExport(jobs), `Jobs_${format(new Date(), 'yyyy-MM-dd')}`, 'Jobs');
    toast.success('Jobs exportados!');
  };

  const handleExportPayments = () => {
    if (!payments) return;
    exportToExcel(formatPaymentsForExport(payments), `Pagamentos_${format(new Date(), 'yyyy-MM-dd')}`, 'Pagamentos');
    toast.success('Pagamentos exportados!');
  };

  // Calculate date range
  const endDate = new Date();
  const startDate = subMonths(endDate, parseInt(period));
  const months = eachMonthOfInterval({ start: startDate, end: endDate });

  // Revenue by month
  const revenueByMonth = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const revenue = payments?.filter(p => {
      const paidDate = new Date(p.paid_at || p.created_at);
      return p.status === 'paid' && paidDate >= monthStart && paidDate <= monthEnd;
    }).reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    return {
      month: format(month, 'MMM yyyy', { locale: pt }),
      revenue: revenue, // Show full number, not in thousands
    };
  });

  // Revenue by job type
  const jobsByType = jobs?.reduce((acc, job) => {
    const type = job.type || 'Outro';
    if (!acc[type]) {
      acc[type] = { type, revenue: 0, count: 0 };
    }
    acc[type].revenue += Number(job.estimated_revenue || 0);
    acc[type].count += 1;
    return acc;
  }, {} as Record<string, { type: string; revenue: number; count: number }>);

  const revenueByType = Object.values(jobsByType || {}).map(item => ({
    name: item.type,
    value: item.revenue, // Show full number, not in thousands
    count: item.count,
  }));

  // Conversion funnel
  const totalLeads = leads?.length || 0;
  const contactedLeads = leads?.filter(l => l.status !== 'new').length || 0;
  const proposalSent = leads?.filter(l => l.status === 'proposal_sent').length || 0;
  const wonLeads = leads?.filter(l => l.status === 'won').length || 0;

  const funnelData = [
    { stage: 'Leads', count: totalLeads, rate: 100 },
    { stage: 'Contactados', count: contactedLeads, rate: totalLeads > 0 ? (contactedLeads / totalLeads) * 100 : 0 },
    { stage: 'Propostas', count: proposalSent, rate: totalLeads > 0 ? (proposalSent / totalLeads) * 100 : 0 },
    { stage: 'Ganhos', count: wonLeads, rate: totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0 },
  ];

  // Top clients by revenue
  const clientRevenue = clients?.map(client => {
    const clientPayments = payments?.filter(p => p.client_id === client.id && p.status === 'paid') || [];
    const revenue = clientPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const jobCount = jobs?.filter(j => j.client_id === client.id).length || 0;
    
    return {
      name: client.name,
      revenue,
      jobs: jobCount,
    };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 10) || [];

  // Calculate statistics
  const totalRevenue = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const pendingRevenue = payments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const completedJobs = jobs?.filter(j => j.status === 'completed').length || 0;
  const activeClients = clients?.filter(c => {
    return jobs?.some(j => j.client_id === c.id && j.status !== 'cancelled');
  }).length || 0;
  const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;
  const avgJobValue = completedJobs > 0 ? (totalRevenue / completedJobs).toFixed(0) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-8">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary">Analytics</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Relatórios Financeiros</h1>
            <p className="text-muted-foreground">Análise completa do desempenho do negócio</p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Últimos 3 meses</SelectItem>
                <SelectItem value="6">Últimos 6 meses</SelectItem>
                <SelectItem value="12">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExportAll} variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar Tudo</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 bg-gradient-to-br from-success/10 to-card border-success/20 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold text-success mt-1">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">De {completedJobs} jobs concluídos</p>
            </div>
            <div className="p-3 rounded-lg bg-success/10">
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-warning/10 to-card border-warning/20 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Receita Pendente</p>
              <p className="text-2xl font-bold text-warning mt-1">{formatCurrency(pendingRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">Aguardando pagamento</p>
            </div>
            <div className="p-3 rounded-lg bg-warning/10">
              <Calendar className="h-8 w-8 text-warning" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-info/10 to-card border-info/20 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Ticket Médio</p>
              <p className="text-2xl font-bold text-info mt-1">{formatCurrency(Number(avgJobValue))}</p>
              <p className="text-xs text-muted-foreground mt-1">Por job concluído</p>
            </div>
            <div className="p-3 rounded-lg bg-info/10">
              <Briefcase className="h-8 w-8 text-info" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-accent/10 to-card border-accent/20 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Clientes Ativos</p>
              <p className="text-2xl font-bold text-accent-foreground mt-1">{activeClients}</p>
              <p className="text-xs text-muted-foreground mt-1">Com jobs ativos</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/10">
              <Users className="h-8 w-8 text-accent-foreground" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary/10 to-card border-primary/20 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-primary mt-1">{conversionRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Leads → Clientes</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <Target className="h-8 w-8 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-secondary/10 to-card border-secondary/20 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total de Jobs</p>
              <p className="text-2xl font-bold text-secondary-foreground mt-1">{jobs?.length || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">{completedJobs} concluídos</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/10">
              <TrendingUp className="h-8 w-8 text-secondary-foreground" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Month */}
        <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              Evolução da Receita
            </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Receita" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue by Type */}
        <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              Receita por Tipo de Job
            </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
          </div>
        </Card>

        {/* Conversion Funnel */}
        <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              Funil de Conversão
            </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="stage" type="category" width={100} />
              <Tooltip formatter={(value, name) => name === 'rate' ? `${Number(value).toFixed(1)}%` : value} />
              <Legend />
              <Bar dataKey="count" name="Quantidade" fill="#3b82f6" />
              <Bar dataKey="rate" name="Taxa (%)" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Clients */}
        <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              Top 10 Clientes
            </h3>
          <div className="space-y-3">
            {clientRevenue.slice(0, 5).map((client, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium text-sm">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.jobs} jobs</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{formatCurrency(client.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
          </div>
        </Card>
      </div>
    </div>
  );
}