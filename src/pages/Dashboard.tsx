import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useJobs } from "@/hooks/useJobs";
import { usePayments } from "@/hooks/usePayments";
import { useLeads } from "@/hooks/useLeads";
import { useClients } from "@/hooks/useClients";
import { Briefcase, DollarSign, TrendingUp, Users, Calendar, AlertCircle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { format, isAfter, isBefore, addDays, startOfDay } from "date-fns";
import { pt } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SmartNotificationPanel } from "@/components/SmartNotificationPanel";
import { RevenueChart } from "@/components/RevenueChart";
import { JobStatusChart } from "@/components/JobStatusChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomizableDashboard } from "@/components/CustomizableDashboard";
import { GalleriesWidget } from "@/components/GalleriesWidget";
import { PaymentAlertsWidget } from "@/components/PaymentAlertsWidget";
import { ActionableAlerts } from "@/components/ActionableAlerts";
import { useActionableAlerts } from "@/hooks/useActionableAlerts";
import { useQuotes } from "@/hooks/useQuotes";
import { useContracts } from "@/hooks/useContracts";
import { useInvoices } from "@/hooks/useInvoices";
import { NotificationTestPanel } from "@/components/NotificationTestPanel";
const statusColors = {
  confirmed: "success",
  pending: "warning",
  new: "primary",
  contacted: "accent",
  proposal: "secondary"
} as const;
export default function Dashboard() {
  const {
    data: jobs,
    isLoading: jobsLoading
  } = useJobs();
  const {
    data: leads,
    isLoading: leadsLoading
  } = useLeads();
  const {
    data: clients,
    isLoading: clientsLoading
  } = useClients();
  const {
    data: payments,
    isLoading: paymentsLoading
  } = usePayments();
  const {
    data: quotes,
    isLoading: quotesLoading
  } = useQuotes();
  const {
    data: contracts,
    isLoading: contractsLoading
  } = useContracts();
  const {
    data: invoices,
    isLoading: invoicesLoading
  } = useInvoices();

  // FASE 4: Automations removed from Dashboard (centralized in Layout)

  // Get actionable alerts
  const alerts = useActionableAlerts({
    quotes,
    invoices,
    payments,
    contracts,
    jobs,
    leads
  });
  const upcomingJobs = jobs?.filter(j => j.status === 'confirmed' || j.status === 'scheduled').slice(0, 3) || [];
  const displayedLeads = leads?.slice(0, 3) || [];

  // Active jobs count
  const activeJobs = jobs?.filter(j => j.status !== 'completed' && j.status !== 'cancelled').length || 0;
  const previousActiveJobs = jobs?.filter(j => {
    const createdDate = new Date(j.created_at);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate >= sixtyDaysAgo && createdDate < thirtyDaysAgo && j.status !== 'completed' && j.status !== 'cancelled';
  }).length || 0;
  const jobsChange = previousActiveJobs > 0 ? ((activeJobs - previousActiveJobs) / previousActiveJobs * 100).toFixed(1) : '0';

  // Total revenue from paid payments
  const totalRevenue = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const previousRevenue = payments?.filter(p => {
    const paidDate = new Date(p.paid_at || p.created_at);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return paidDate >= sixtyDaysAgo && paidDate < thirtyDaysAgo && p.status === 'paid';
  }).reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue * 100).toFixed(1) : '0';

  // New clients last 30 days
  const newClients = clients?.filter(c => {
    const createdDate = new Date(c.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate >= thirtyDaysAgo;
  }).length || 0;
  const previousNewClients = clients?.filter(c => {
    const createdDate = new Date(c.created_at);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate >= sixtyDaysAgo && createdDate < thirtyDaysAgo;
  }).length || 0;
  const clientsChange = previousNewClients > 0 ? ((newClients - previousNewClients) / previousNewClients * 100).toFixed(1) : '0';

  // Conversion rate (last 30 days only)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentLeads = leads?.filter(l => {
    const createdDate = new Date(l.created_at);
    return createdDate >= thirtyDaysAgo;
  }) || [];
  const wonLeads = recentLeads.filter(l => l.status === 'won').length;
  const totalLeads = recentLeads.length || 1;
  const conversionRate = (wonLeads / totalLeads * 100).toFixed(0);

  // Previous period (30-60 days ago)
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const previousLeads = leads?.filter(l => {
    const createdDate = new Date(l.created_at);
    return createdDate >= sixtyDaysAgo && createdDate < thirtyDaysAgo;
  }) || [];
  const previousWonLeads = previousLeads.filter(l => l.status === 'won').length;
  const previousTotalLeads = previousLeads.length || 1;
  const previousConversionRate = previousWonLeads / previousTotalLeads * 100;
  const conversionChange = previousConversionRate > 0 ? (wonLeads / totalLeads * 100 - previousConversionRate).toFixed(1) : '0';
  const stats = [{
    name: "Receita Total",
    value: `Kz ${totalRevenue.toFixed(0)}`,
    change: `${Number(revenueChange) >= 0 ? '+' : ''}${revenueChange}%`,
    trend: Number(revenueChange) >= 0 ? "up" : "down",
    icon: DollarSign
  }, {
    name: "Jobs Ativos",
    value: activeJobs.toString(),
    change: `${Number(jobsChange) >= 0 ? '+' : ''}${jobsChange}%`,
    trend: Number(jobsChange) >= 0 ? "up" : "down",
    icon: Briefcase
  }, {
    name: "Novos Clientes",
    value: newClients.toString(),
    change: `${Number(clientsChange) >= 0 ? '+' : ''}${clientsChange}%`,
    trend: Number(clientsChange) >= 0 ? "up" : "down",
    icon: Users
  }, {
    name: "Taxa Conversão",
    value: `${conversionRate}%`,
    change: `${Number(conversionChange) >= 0 ? '+' : ''}${conversionChange}%`,
    trend: Number(conversionChange) >= 0 ? "up" : "down",
    icon: TrendingUp
  }];
  if (jobsLoading || leadsLoading || clientsLoading || paymentsLoading || quotesLoading || contractsLoading || invoicesLoading) {
    return <div className="space-y-6">Carregando...</div>;
  }
  return <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Visão geral do seu negócio fotográfico</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto max-w-md">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-2.5">Visão Geral</TabsTrigger>
          <TabsTrigger value="custom" className="text-xs sm:text-sm py-2.5">Personalizável</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-6">
          {/* Actionable Alerts */}
          <ActionableAlerts alerts={alerts} />

          {/* Test Notifications Panel */}
          <NotificationTestPanel />

          {/* Smart Notifications */}
          <SmartNotificationPanel />

          {/* Stats Grid */}
          <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <TooltipProvider>
              {stats.map(stat => <Card key={stat.name} className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                          <span className={`text-xs sm:text-sm font-medium ${stat.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                            {stat.change}
                          </span>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          {stat.name === "Taxa Conversão" ? "Últimos 30 dias vs período anterior (30-60 dias)" : "Últimos 30 dias vs período anterior"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.name}</p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                </Card>)}
            </TooltipProvider>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Upcoming Jobs */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Próximos Trabalhos</h2>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {upcomingJobs.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">Nenhum job próximo</p> : upcomingJobs.map(job => <div key={job.id} className="p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 flex-wrap mb-2">
                          <h3 className="font-medium text-sm sm:text-base text-foreground flex-1">{job.title}</h3>
                          <Badge variant={statusColors[job.status] || 'secondary'} className="text-xs shrink-0">
                            {job.status === "confirmed" ? "Confirmado" : job.status === "scheduled" ? "Agendado" : "Pendente"}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                          {job.clients?.name || 'Cliente não especificado'}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <span>{new Date(job.start_datetime).toLocaleDateString("pt-PT")}</span>
                          <span>•</span>
                          <span>{new Date(job.start_datetime).toLocaleTimeString("pt-PT", {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                          <span>•</span>
                          <span className="truncate">{job.type}</span>
                        </div>
                      </div>
                    </div>)}
              </div>
            </Card>

            {/* Recent Leads */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Pontencias Clientes Recentes</h2>
              </div>
               <div className="space-y-3 sm:space-y-4">
                {displayedLeads.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">Nenhum lead recente</p> : displayedLeads.map(lead => <div key={lead.id} className="p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 flex-wrap mb-2">
                          <h3 className="font-medium text-sm sm:text-base text-foreground flex-1">
                            {lead.clients?.name || 'Nome não especificado'}
                          </h3>
                          <Badge variant={statusColors[lead.status] || 'secondary'} className="text-xs shrink-0">
                            {lead.status === "new" ? "Novo" : lead.status === "contacted" ? "Contactado" : lead.status === "won" ? "Ganho" : lead.status === "proposal_sent" ? "Proposta" : "Perdido"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          {lead.source && <>
                              <span>via {lead.source}</span>
                              <span>•</span>
                            </>}
                          <span>{new Date(lead.created_at).toLocaleDateString("pt-PT")}</span>
                        </div>
                      </div>
                    </div>)}
              </div>
            </Card>
          </div>

          {/* Widgets */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
            <PaymentAlertsWidget />
            <GalleriesWidget />
          </div>

          {/* Charts Section */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
            <RevenueChart payments={payments || []} />
            <JobStatusChart jobs={jobs || []} />
          </div>
        </TabsContent>

        <TabsContent value="custom" className="mt-6">
          <CustomizableDashboard />
        </TabsContent>
      </Tabs>
    </div>;
}