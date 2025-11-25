import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Briefcase, FileText, DollarSign, FileCheck, CalendarDays, TrendingUp, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface AggregateMetrics {
  totalUsers: number;
  totalClients: number;
  totalJobs: number;
  totalQuotes: number;
  totalInvoices: number;
  totalContracts: number;
  totalPayments: number;
  totalPaymentAmount: number;
  totalInvoiceAmount: number;
  averageClientsPerUser: number;
  averageJobsPerUser: number;
  averageRevenuePerUser: number;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const AdminMetrics = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<AggregateMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      // Fetch all data in parallel
      const [
        { count: totalUsers },
        { count: totalClients },
        { count: totalJobs },
        { count: totalQuotes },
        { count: totalInvoices },
        { count: totalContracts },
        { count: totalPayments },
        { data: paymentData },
        { data: invoiceData }
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("clients").select("*", { count: "exact", head: true }),
        supabase.from("jobs").select("*", { count: "exact", head: true }),
        supabase.from("quotes").select("*", { count: "exact", head: true }),
        supabase.from("invoices").select("*", { count: "exact", head: true }),
        supabase.from("contracts").select("*", { count: "exact", head: true }),
        supabase.from("payments").select("*", { count: "exact", head: true }),
        supabase.from("payments").select("amount"),
        supabase.from("invoices").select("total")
      ]);

      const totalPaymentAmount = paymentData?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
      const totalInvoiceAmount = invoiceData?.reduce((sum, i) => sum + (Number(i.total) || 0), 0) || 0;

      setMetrics({
        totalUsers: totalUsers || 0,
        totalClients: totalClients || 0,
        totalJobs: totalJobs || 0,
        totalQuotes: totalQuotes || 0,
        totalInvoices: totalInvoices || 0,
        totalContracts: totalContracts || 0,
        totalPayments: totalPayments || 0,
        totalPaymentAmount,
        totalInvoiceAmount,
        averageClientsPerUser: totalUsers ? (totalClients || 0) / totalUsers : 0,
        averageJobsPerUser: totalUsers ? (totalJobs || 0) / totalUsers : 0,
        averageRevenuePerUser: totalUsers ? totalPaymentAmount / totalUsers : 0,
      });
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Erro ao carregar métricas</p>
      </div>
    );
  }

  const entityData = [
    { name: "Clientes", value: metrics.totalClients, color: COLORS[0] },
    { name: "Trabalhos", value: metrics.totalJobs, color: COLORS[1] },
    { name: "Orçamentos", value: metrics.totalQuotes, color: COLORS[2] },
    { name: "Faturas", value: metrics.totalInvoices, color: COLORS[3] },
    { name: "Contratos", value: metrics.totalContracts, color: COLORS[4] },
  ];

  const averageData = [
    { name: "Clientes/Usuário", value: metrics.averageClientsPerUser.toFixed(1) },
    { name: "Trabalhos/Usuário", value: metrics.averageJobsPerUser.toFixed(1) },
    { name: "Receita/Usuário", value: (metrics.averageRevenuePerUser / 1000).toFixed(1) + "k" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/50">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between gap-2 mb-3 md:mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/subscribers")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/admin/ranking")}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Ver Ranking
            </Button>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Métricas Globais</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Dashboard agregado de todos os assinantes do sistema
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Total Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Totais Globais
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assinantes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Total de utilizadores</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{metrics.totalClients}</div>
                <p className="text-xs text-muted-foreground">Total de clientes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trabalhos</CardTitle>
                <Briefcase className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{metrics.totalJobs}</div>
                <p className="text-xs text-muted-foreground">Total de trabalhos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
                <FileText className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{metrics.totalQuotes}</div>
                <p className="text-xs text-muted-foreground">Total de orçamentos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturas</CardTitle>
                <FileCheck className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{metrics.totalInvoices}</div>
                <p className="text-xs text-muted-foreground">Total de faturas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contratos</CardTitle>
                <CalendarDays className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{metrics.totalContracts}</div>
                <p className="text-xs text-muted-foreground">Total de contratos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagamentos</CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{metrics.totalPayments}</div>
                <p className="text-xs text-muted-foreground">Total de pagamentos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {new Intl.NumberFormat('pt-AO', {
                    style: 'currency',
                    currency: 'AOA',
                    minimumFractionDigits: 0,
                  }).format(metrics.totalPaymentAmount)}
                </div>
                <p className="text-xs text-muted-foreground">Valor total de pagamentos</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Average Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Médias por Assinante
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Clientes por Assinante</CardTitle>
                <CardDescription>Média de clientes registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600">
                  {metrics.averageClientsPerUser.toFixed(1)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trabalhos por Assinante</CardTitle>
                <CardDescription>Média de trabalhos criados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600">
                  {metrics.averageJobsPerUser.toFixed(1)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Receita por Assinante</CardTitle>
                <CardDescription>Média de receita gerada</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-yellow-600">
                  {new Intl.NumberFormat('pt-AO', {
                    style: 'currency',
                    currency: 'AOA',
                    minimumFractionDigits: 0,
                  }).format(metrics.averageRevenuePerUser)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Entidades</CardTitle>
              <CardDescription>Total de cada tipo de entidade no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: {
                    label: "Quantidade",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={entityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="hsl(var(--chart-1))" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Proporção de Entidades</CardTitle>
              <CardDescription>Distribuição percentual no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: {
                    label: "Quantidade",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={entityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {entityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminMetrics;
