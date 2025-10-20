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
import { TrendingUp, DollarSign, Briefcase, Users, Target, Calendar, Download } from "lucide-react";
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

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57'];

export default function Reports() {
  const [period, setPeriod] = useState("6");
  const { data: jobs } = useJobs();
  const { data: payments } = usePayments();
  const { data: leads } = useLeads();
  const { data: clients } = useClients();
  const { data: quotes } = useQuotes();

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
      revenue: revenue / 1000, // Convert to thousands
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
    value: item.revenue / 1000,
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Relatórios Financeiros</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Análise completa do desempenho do negócio</p>
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

      {/* Key Metrics */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{(totalRevenue / 1000).toFixed(1)}K Kz</p>
              <p className="text-xs text-muted-foreground mt-1">De {completedJobs} jobs concluídos</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-500/30" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Receita Pendente</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{(pendingRevenue / 1000).toFixed(1)}K Kz</p>
              <p className="text-xs text-muted-foreground mt-1">Aguardando pagamento</p>
            </div>
            <Calendar className="h-10 w-10 text-orange-500/30" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Ticket Médio</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{(Number(avgJobValue) / 1000).toFixed(1)}K Kz</p>
              <p className="text-xs text-muted-foreground mt-1">Por job concluído</p>
            </div>
            <Briefcase className="h-10 w-10 text-blue-500/30" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Clientes Ativos</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{activeClients}</p>
              <p className="text-xs text-muted-foreground mt-1">Com jobs ativos</p>
            </div>
            <Users className="h-10 w-10 text-purple-500/30" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-primary mt-1">{conversionRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Leads → Clientes</p>
            </div>
            <Target className="h-10 w-10 text-primary/30" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border-indigo-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total de Jobs</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{jobs?.length || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">{completedJobs} concluídos</p>
            </div>
            <TrendingUp className="h-10 w-10 text-indigo-500/30" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Month */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Evolução da Receita
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${Number(value).toFixed(1)}K Kz`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Receita (mil Kz)" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue by Type */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
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
              <Tooltip formatter={(value) => `${Number(value).toFixed(1)}K Kz`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Conversion Funnel */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
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
        </Card>

        {/* Top Clients */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
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
                  <p className="font-semibold text-sm">{(client.revenue / 1000).toFixed(1)}K Kz</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}