import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Calendar, MapPin, Pencil, Camera, Video, Users as UsersIcon, Briefcase, Download, CreditCard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJobs } from "@/hooks/useJobs";
import { JobDialog } from "@/components/JobDialog";
import { PaymentPlanDialog } from "@/components/PaymentPlanDialog";
import { exportToExcel, formatJobsForExport } from "@/lib/exportUtils";
import { toast } from "sonner";

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
  const [sortBy, setSortBy] = useState<"date" | "value">("date");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [paymentPlanJob, setPaymentPlanJob] = useState<any>(null);
  const [paymentPlanDialogOpen, setPaymentPlanDialogOpen] = useState(false);
  const { data: jobs, isLoading } = useJobs();

  const handleExport = () => {
    if (jobs && jobs.length > 0) {
      const formatted = formatJobsForExport(jobs);
      exportToExcel(formatted, "jobs.xlsx", "Jobs");
      toast.success("Jobs exportados com sucesso!");
    }
  };

  const jobTypes = useMemo(() => {
    const uniqueTypes = new Set(jobs?.map(j => j.type).filter(Boolean));
    return Array.from(uniqueTypes);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    let filtered = jobs?.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "all" || job.status === activeTab;
      const matchesType = typeFilter === "all" || job.type === typeFilter;
      return matchesSearch && matchesTab && matchesType;
    }) || [];

    // Ordenação
    if (sortBy === "date") {
      filtered.sort((a, b) => new Date(b.start_datetime).getTime() - new Date(a.start_datetime).getTime());
    } else if (sortBy === "value") {
      filtered.sort((a, b) => (Number(b.estimated_revenue) || 0) - (Number(a.estimated_revenue) || 0));
    }

    return filtered;
  }, [jobs, searchQuery, activeTab, typeFilter, sortBy]);

  const showEmptyState = !isLoading && (!jobs || jobs.length === 0);

  if (isLoading) {
    return <div className="space-y-6">Carregando...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Jobs & Projetos</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie eventos, sessões fotográficas e produções do início ao fim
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
          <JobDialog>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Novo Job
            </Button>
          </JobDialog>
        </div>
      </div>

      {showEmptyState ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <Briefcase className="h-12 w-12 text-primary" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Comece a organizar seus trabalhos</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Crie jobs para casamentos, eventos, sessões fotográficas e outros projetos. 
              Controle datas, locais, equipamentos e equipe em um só lugar.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <Camera className="h-8 w-8 text-primary" />
                <div className="text-sm font-medium">Tipos de Trabalho</div>
                <div className="text-xs text-muted-foreground text-center">
                  Casamentos, eventos, retratos, produtos
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <Calendar className="h-8 w-8 text-primary" />
                <div className="text-sm font-medium">Agendamento</div>
                <div className="text-xs text-muted-foreground text-center">
                  Datas, horários e sincronização
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <UsersIcon className="h-8 w-8 text-primary" />
                <div className="text-sm font-medium">Equipe & Recursos</div>
                <div className="text-xs text-muted-foreground text-center">
                  Atribua fotógrafos e equipamentos
                </div>
              </div>
            </div>

            <JobDialog>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Criar Primeiro Job
              </Button>
            </JobDialog>

            <div className="mt-8 p-4 bg-muted/30 rounded-lg max-w-2xl">
              <p className="text-sm text-muted-foreground">
                <strong>Fluxo completo:</strong> Lead → Orçamento → Job → Produção → Entrega → Pagamento
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex">
          <TabsTrigger value="all" className="text-xs sm:text-sm">Todos</TabsTrigger>
          <TabsTrigger value="confirmed" className="text-xs sm:text-sm">Confirmados</TabsTrigger>
          <TabsTrigger value="in_production" className="text-xs sm:text-sm hidden sm:inline-flex">Em Produção</TabsTrigger>
              <TabsTrigger value="scheduled" className="text-xs sm:text-sm hidden sm:inline-flex">Agendados</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <Card className="p-6">
                <div className="mb-6 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Pesquisar por título ou cliente..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        {jobTypes.map(type => (
                          <SelectItem key={type} value={type!}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Ordenar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Mais recentes</SelectItem>
                        <SelectItem value="value">Maior valor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredJobs.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium mb-1">Nenhum job encontrado</p>
                      <p className="text-sm">
                        {searchQuery ? 'Tente ajustar os termos de pesquisa' : `Nenhum job com status "${activeTab}"`}
                      </p>
                    </div>
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
                        <div className="flex flex-col gap-2">
                          <JobDialog job={job}>
                            <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm">
                              <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                              Editar
                            </Button>
                          </JobDialog>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 text-xs sm:text-sm"
                            onClick={() => {
                              setPaymentPlanJob(job);
                              setPaymentPlanDialogOpen(true);
                            }}
                          >
                            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                            Plano
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      
      <PaymentPlanDialog
        jobId={paymentPlanJob?.id}
        totalAmount={paymentPlanJob?.estimated_revenue || 0}
        open={paymentPlanDialogOpen}
        onOpenChange={setPaymentPlanDialogOpen}
      />
    </div>
  );
}
