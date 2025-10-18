import { Card } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  DollarSign,
  Calendar,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useJobs } from "@/hooks/useJobs";
import { useLeads } from "@/hooks/useLeads";
import { useClients } from "@/hooks/useClients";

const statusColors = {
  confirmed: "success",
  pending: "warning",
  new: "primary",
  contacted: "accent",
  proposal: "secondary",
} as const;

export default function Dashboard() {
  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const { data: leads, isLoading: leadsLoading } = useLeads();
  const { data: clients, isLoading: clientsLoading } = useClients();

  const upcomingJobs = jobs?.filter(j => j.status === 'confirmed' || j.status === 'scheduled').slice(0, 3) || [];
  const recentLeads = leads?.slice(0, 3) || [];
  
  const activeJobs = jobs?.filter(j => j.status !== 'completed' && j.status !== 'cancelled').length || 0;
  const totalRevenue = jobs?.reduce((sum, j) => sum + (Number(j.estimated_revenue) || 0), 0) || 0;
  const newClients = clients?.filter(c => {
    const createdDate = new Date(c.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate >= thirtyDaysAgo;
  }).length || 0;

  const stats = [
    {
      name: "Receita Total",
      value: `Kz${totalRevenue.toFixed(0)}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      name: "Jobs Ativos",
      value: activeJobs.toString(),
      change: "+4",
      trend: "up",
      icon: Briefcase,
    },
    {
      name: "Novos Clientes",
      value: newClients.toString(),
      change: "+2",
      trend: "up",
      icon: Users,
    },
    {
      name: "Taxa Conversão",
      value: "68%",
      change: "+5%",
      trend: "up",
      icon: TrendingUp,
    },
  ];

  if (jobsLoading || leadsLoading || clientsLoading) {
    return <div className="space-y-6">Carregando...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Visão geral do seu negócio fotográfico</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-success">{stat.change}</span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Jobs */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Próximos Jobs</h2>
          </div>
          <div className="space-y-4">
            {upcomingJobs.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhum job próximo</p>
            ) : (
              upcomingJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-foreground">{job.title}</h3>
                      <Badge variant={statusColors[job.status] || 'secondary'}>
                        {job.status === "confirmed" ? "Confirmado" : 
                         job.status === "scheduled" ? "Agendado" : "Pendente"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {job.clients?.name || 'Cliente não especificado'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{new Date(job.start_datetime).toLocaleDateString("pt-PT")}</span>
                      <span>•</span>
                      <span>{new Date(job.start_datetime).toLocaleTimeString("pt-PT", { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>{job.type}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Leads */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Leads Recentes</h2>
          </div>
          <div className="space-y-4">
            {recentLeads.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhum lead recente</p>
            ) : (
              recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-foreground">
                        {lead.clients?.name || 'Nome não especificado'}
                      </h3>
                      <Badge variant={statusColors[lead.status] || 'secondary'}>
                        {lead.status === "new" ? "Novo" : 
                         lead.status === "contacted" ? "Contactado" : 
                         lead.status === "won" ? "Ganho" :
                         lead.status === "proposal_sent" ? "Proposta Enviada" : "Perdido"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {lead.source && (
                        <>
                          <span>via {lead.source}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{new Date(lead.created_at).toLocaleDateString("pt-PT")}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
