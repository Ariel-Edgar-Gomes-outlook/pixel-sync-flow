import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar, MapPin, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockJobs = [
  {
    id: "1",
    title: "Casamento Silva & Costa",
    client: "Maria Silva",
    type: "Casamento",
    date: "2025-10-25",
    time: "14:00",
    location: "Quinta do Lago, Faro",
    status: "confirmed",
    team: ["Fotógrafo Principal", "Assistente"],
    value: 2450,
  },
  {
    id: "2",
    title: "Sessão Família Rodrigues",
    client: "João Rodrigues",
    type: "Retrato",
    date: "2025-10-26",
    time: "10:00",
    location: "Parque da Cidade, Porto",
    status: "confirmed",
    team: ["Fotógrafo Principal"],
    value: 450,
  },
  {
    id: "3",
    title: "Evento Corporativo TechStart",
    client: "TechStart Lda",
    type: "Evento",
    date: "2025-10-28",
    time: "18:00",
    location: "Centro de Congressos, Lisboa",
    status: "pending",
    team: ["Fotógrafo Principal", "Editor"],
    value: 1800,
  },
  {
    id: "4",
    title: "Fotografia de Produto - Linha Verão",
    client: "Fashion Store",
    type: "Comercial",
    date: "2025-11-02",
    time: "09:00",
    location: "Estúdio PhotoFlow",
    status: "scheduled",
    team: ["Fotógrafo Principal", "Assistente", "Estilista"],
    value: 3200,
  },
];

const statusConfig = {
  confirmed: { label: "Confirmado", variant: "success" as const },
  pending: { label: "Pendente", variant: "warning" as const },
  scheduled: { label: "Agendado", variant: "primary" as const },
  completed: { label: "Concluído", variant: "secondary" as const },
};

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || job.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Jobs & Projetos</h1>
          <p className="text-muted-foreground mt-1">Gestão de eventos, sessões e produções</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Job
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmados</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="scheduled">Agendados</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card className="p-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-5 rounded-lg border border-border bg-card hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                        <Badge variant={statusConfig[job.status as keyof typeof statusConfig].variant}>
                          {statusConfig[job.status as keyof typeof statusConfig].label}
                        </Badge>
                        <Badge variant="outline">{job.type}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(job.date).toLocaleDateString("pt-PT")} às {job.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{job.team.join(", ")}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Cliente: </span>
                          <span className="font-medium text-foreground">{job.client}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-6">
                      <div className="text-2xl font-bold text-foreground">€{job.value}</div>
                      <Button variant="outline" size="sm" className="mt-3">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
