import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar, MapPin, Pencil } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJobs } from "@/hooks/useJobs";
import { JobDialog } from "@/components/JobDialog";

const statusConfig = {
  confirmed: { label: "Confirmado", variant: "success" as const },
  in_production: { label: "Em Produção", variant: "warning" as const },
  scheduled: { label: "Agendado", variant: "primary" as const },
  completed: { label: "Concluído", variant: "secondary" as const },
  delivery_pending: { label: "Entrega Pendente", variant: "warning" as const },
  cancelled: { label: "Cancelado", variant: "destructive" as const },
};

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { data: jobs, isLoading } = useJobs();

  const filteredJobs = jobs?.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || job.status === activeTab;
    return matchesSearch && matchesTab;
  }) || [];

  if (isLoading) {
    return <div className="space-y-6">Carregando...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Jobs & Projetos</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Gestão de eventos, sessões e produções</p>
        </div>
        <JobDialog>
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Novo Job
          </Button>
        </JobDialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex">
          <TabsTrigger value="all" className="text-xs sm:text-sm">Todos</TabsTrigger>
          <TabsTrigger value="confirmed" className="text-xs sm:text-sm">Confirmados</TabsTrigger>
          <TabsTrigger value="in_production" className="text-xs sm:text-sm hidden sm:inline-flex">Em Produção</TabsTrigger>
          <TabsTrigger value="scheduled" className="text-xs sm:text-sm hidden sm:inline-flex">Agendados</TabsTrigger>
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
              {filteredJobs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {searchQuery ? 'Nenhum job encontrado' : 'Nenhum job cadastrado'}
                </p>
              ) : (
                filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 sm:p-5 rounded-lg border border-border bg-card hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-semibold text-foreground">{job.title}</h3>
                          <Badge variant={statusConfig[job.status as keyof typeof statusConfig]?.variant || 'secondary'} className="text-xs">
                            {statusConfig[job.status as keyof typeof statusConfig]?.label || job.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{job.type}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-3 sm:mt-4">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 shrink-0" />
                            <span>
                              {new Date(job.start_datetime).toLocaleDateString("pt-PT")} às{" "}
                              {new Date(job.start_datetime).toLocaleTimeString("pt-PT", { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {job.location && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 shrink-0" />
                              <span className="truncate">{job.location}</span>
                            </div>
                          )}
                          <div className="text-xs sm:text-sm">
                            <span className="text-muted-foreground">Cliente: </span>
                            <span className="font-medium text-foreground">
                              {job.clients?.name || 'Não especificado'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2 sm:ml-6">
                        {job.estimated_revenue && (
                          <div className="text-xl sm:text-2xl font-bold text-foreground">Kz {Number(job.estimated_revenue).toFixed(0)}</div>
                        )}
                        <JobDialog job={job}>
                          <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm">
                            <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                            Editar
                          </Button>
                        </JobDialog>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
