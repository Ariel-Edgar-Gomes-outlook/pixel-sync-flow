import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Calendar, MapPin, Pencil, Camera, Video, Users as UsersIcon, Briefcase, Download, CreditCard, Sparkles, FileText, Package, Wrench, Eye, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJobs, useDeleteJob } from "@/hooks/useJobs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { JobDialog } from "@/components/JobDialog";
import { JobDetailsDialog } from "@/components/JobDetailsDialog";
import { PaymentPlanDialog } from "@/components/PaymentPlanDialog";
import { QuickStartWizard } from "@/components/QuickStartWizard";
import { JobRelationsPanel } from "@/components/JobRelationsPanel";
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
  const [quickStartOpen, setQuickStartOpen] = useState(false);
  const [detailsJobId, setDetailsJobId] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { data: jobs, isLoading } = useJobs();
  const deleteJob = useDeleteJob();

  const handleDeleteJob = async () => {
    if (!deleteJobId) return;
    
    try {
      await deleteJob.mutateAsync(deleteJobId);
      toast.success("Trabalho eliminado com sucesso!");
      setDeleteDialogOpen(false);
      setDeleteJobId(null);
    } catch (error: any) {
      console.error("Erro ao eliminar trabalho:", error);
      toast.error("Erro ao eliminar trabalho: " + error.message);
    }
  };

  const handleExport = () => {
    if (jobs && jobs.length > 0) {
      const formatted = formatJobsForExport(jobs);
      exportToExcel(formatted, "trabalhos.xlsx", "Trabalhos");
      toast.success("Trabalhos exportados com sucesso!");
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
    <div className="space-y-6 animate-fade-in">
      {/* Hero Header com Gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Trabalhos & Projetos</h1>
              <p className="text-white/90 mt-1">Gerencie eventos, sessões e produções</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button 
              variant="secondary" 
              size="sm" 
              className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm" 
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button 
              size="sm"
              className="gap-2 bg-white text-primary hover:bg-white/90 shadow-lg"
              onClick={() => setQuickStartOpen(true)}
            >
              <Sparkles className="h-4 w-4" />
              Início Rápido
            </Button>
            <JobDialog>
              <Button 
                variant="secondary" 
                size="sm" 
                className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              >
                <Plus className="h-4 w-4" />
                Manual
              </Button>
            </JobDialog>
          </div>
        </div>
      </div>

      {showEmptyState ? (
        <Card className="border-dashed glass hover-lift">
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

            <div className="flex gap-3">
              <Button 
                size="lg" 
                className="gap-2"
                onClick={() => setQuickStartOpen(true)}
              >
                <Sparkles className="h-5 w-5" />
                Quick Start
              </Button>
              <JobDialog>
                <Button size="lg" variant="outline" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Criar Manualmente
                </Button>
              </JobDialog>
            </div>

            <div className="mt-8 p-4 bg-muted/30 rounded-lg max-w-2xl">
              <p className="text-sm text-muted-foreground">
                <strong>Fluxo completo:</strong> Lead → Orçamento → Job → Produção → Entrega → Pagamento
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <TabsList className="inline-flex w-auto min-w-full sm:w-auto px-3 sm:px-0 h-auto">
              <TabsTrigger value="all" className="text-xs sm:text-sm py-2 whitespace-nowrap">Todos</TabsTrigger>
              <TabsTrigger value="confirmed" className="text-xs sm:text-sm py-2 whitespace-nowrap">Confirmados</TabsTrigger>
              <TabsTrigger value="in_production" className="text-xs sm:text-sm py-2 whitespace-nowrap">Produção</TabsTrigger>
              <TabsTrigger value="scheduled" className="text-xs sm:text-sm py-2 whitespace-nowrap">Agendados</TabsTrigger>
            </TabsList>
          </div>

            <TabsContent value={activeTab} className="mt-4 sm:mt-6">
              <Card className="p-4 sm:p-6 glass hover-lift">
                <div className="mb-4 sm:mb-6 space-y-3">
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Pesquisar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="flex-1 text-xs sm:text-sm">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          <SelectItem value="all">Todos</SelectItem>
                          {jobTypes.map(type => (
                            <SelectItem key={type} value={type!}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                        <SelectTrigger className="flex-1 text-xs sm:text-sm">
                          <SelectValue placeholder="Ordenar" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          <SelectItem value="date">Recentes</SelectItem>
                          <SelectItem value="value">Valor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {filteredJobs.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Search className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                      <p className="font-medium mb-1 text-sm sm:text-base">Nenhum job encontrado</p>
                      <p className="text-xs sm:text-sm">
                        {searchQuery ? 'Ajuste a pesquisa' : `Sem jobs "${activeTab}"`}
                      </p>
                    </div>
                  ) : (
                filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3 sm:p-4 rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-start gap-2">
                        <h3 className="text-sm sm:text-base font-semibold text-foreground flex-1">{job.title}</h3>
                        <Badge variant={statusConfig[job.status as keyof typeof statusConfig]?.variant || 'secondary'} className="text-xs shrink-0">
                          {statusConfig[job.status as keyof typeof statusConfig]?.label || job.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs shrink-0">{job.type}</Badge>
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {new Date(job.start_datetime).toLocaleDateString("pt-PT")} às{" "}
                            {new Date(job.start_datetime).toLocaleTimeString("pt-PT", { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {job.location && (
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
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
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        {job.estimated_revenue && (
                          <div className="text-lg sm:text-xl font-bold text-foreground">Kz {Number(job.estimated_revenue).toFixed(0)}</div>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="gap-1 text-xs h-8"
                            onClick={() => {
                              setDetailsJobId(job.id);
                              setDetailsDialogOpen(true);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                            <span className="hidden sm:inline">Ver</span>
                          </Button>
                          <JobDialog job={job}>
                            <Button variant="outline" size="sm" className="gap-1 text-xs h-8">
                              <Pencil className="h-3 w-3" />
                              <span className="hidden sm:inline">Editar</span>
                            </Button>
                          </JobDialog>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1 text-xs h-8"
                            onClick={() => {
                              setPaymentPlanJob(job);
                              setPaymentPlanDialogOpen(true);
                            }}
                          >
                            <CreditCard className="h-3 w-3" />
                            <span className="hidden sm:inline">Plano</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1 text-xs h-8 text-destructive hover:text-destructive"
                            onClick={() => {
                              setDeleteJobId(job.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                            <span className="hidden sm:inline">Eliminar</span>
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
      
      {detailsJobId && (
        <JobDetailsDialog
          jobId={detailsJobId}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      )}
      
      <PaymentPlanDialog
        jobId={paymentPlanJob?.id}
        totalAmount={paymentPlanJob?.estimated_revenue || 0}
        open={paymentPlanDialogOpen}
        onOpenChange={setPaymentPlanDialogOpen}
      />
      
      <QuickStartWizard 
        open={quickStartOpen}
        onOpenChange={setQuickStartOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar trabalho?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser revertida. Isto irá eliminar permanentemente este trabalho
              e todos os dados relacionados (contratos, faturas, pagamentos, galerias, etc).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteJob}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
