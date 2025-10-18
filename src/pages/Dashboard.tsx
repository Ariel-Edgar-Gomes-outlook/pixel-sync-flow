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

const stats = [
  {
    name: "Receita Mensal",
    value: "€12,450",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
  },
  {
    name: "Jobs Ativos",
    value: "23",
    change: "+4",
    trend: "up",
    icon: Briefcase,
  },
  {
    name: "Novos Clientes",
    value: "8",
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

const upcomingJobs = [
  {
    id: 1,
    title: "Casamento Silva & Costa",
    client: "Maria Silva",
    date: "2025-10-25",
    time: "14:00",
    type: "Casamento",
    status: "confirmed",
  },
  {
    id: 2,
    title: "Sessão Família Rodrigues",
    client: "João Rodrigues",
    date: "2025-10-26",
    time: "10:00",
    type: "Retrato",
    status: "confirmed",
  },
  {
    id: 3,
    title: "Evento Corporativo TechStart",
    client: "TechStart Lda",
    date: "2025-10-28",
    time: "18:00",
    type: "Evento",
    status: "pending",
  },
];

const recentLeads = [
  {
    id: 1,
    name: "Ana Pereira",
    type: "Casamento",
    source: "Instagram",
    status: "new",
  },
  {
    id: 2,
    name: "Pedro Santos",
    type: "Comercial",
    source: "Website",
    status: "contacted",
  },
  {
    id: 3,
    name: "Empresa XYZ",
    type: "Produto",
    source: "Referral",
    status: "proposal",
  },
];

const statusColors = {
  confirmed: "success",
  pending: "warning",
  new: "primary",
  contacted: "accent",
  proposal: "secondary",
} as const;

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do seu negócio fotográfico</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
            {upcomingJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-foreground">{job.title}</h3>
                    <Badge variant={statusColors[job.status]}>
                      {job.status === "confirmed" ? "Confirmado" : "Pendente"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{job.client}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{new Date(job.date).toLocaleDateString("pt-PT")}</span>
                    <span>•</span>
                    <span>{job.time}</span>
                    <span>•</span>
                    <span>{job.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Leads */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Leads Recentes</h2>
          </div>
          <div className="space-y-4">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-foreground">{lead.name}</h3>
                    <Badge variant={statusColors[lead.status]}>
                      {lead.status === "new" ? "Novo" : 
                       lead.status === "contacted" ? "Contactado" : "Proposta"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{lead.type}</span>
                    <span>•</span>
                    <span>via {lead.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
