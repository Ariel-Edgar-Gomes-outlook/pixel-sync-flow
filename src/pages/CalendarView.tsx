import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, AlertTriangle, Users, Package, Calendar } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { useState, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { JobDialog } from "@/components/JobDialog";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomCalendar } from "@/components/CustomCalendar";

export default function CalendarView() {
  const { data: jobs, isLoading } = useJobs();
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showJobSheet, setShowJobSheet] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>(isMobile ? 'week' : 'month');

  // Fetch resources to check conflicts
  const { data: jobResources } = useQuery({
    queryKey: ['all_job_resources'],
    queryFn: async () => {
      const { data, error } = await supabase.from('job_resources').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: teamMembers } = useQuery({
    queryKey: ['all_team_members'],
    queryFn: async () => {
      const { data, error } = await supabase.from('job_team_members').select('*');
      if (error) throw error;
      return data;
    }
  });

  // Check for conflicts
  const checkConflicts = (jobId: string, start: Date, end: Date) => {
    const jobResourcesList = jobResources?.filter(jr => jr.job_id === jobId) || [];
    const jobTeamList = teamMembers?.filter(tm => tm.job_id === jobId) || [];
    let hasResourceConflict = false;
    let hasTeamConflict = false;

    // Check resource conflicts
    for (const resource of jobResourcesList) {
      const otherJobs = jobResources?.filter(jr => 
        jr.resource_id === resource.resource_id && jr.job_id !== jobId
      ) || [];
      
      for (const other of otherJobs) {
        const otherStart = new Date(other.reserved_from);
        const otherEnd = new Date(other.reserved_until);
        if (
          (start >= otherStart && start < otherEnd) ||
          (end > otherStart && end <= otherEnd) ||
          (start <= otherStart && end >= otherEnd)
        ) {
          hasResourceConflict = true;
          break;
        }
      }
      if (hasResourceConflict) break;
    }

    // Check team conflicts
    for (const member of jobTeamList) {
      const otherJobs = jobs?.filter(j => 
        j.id !== jobId && 
        teamMembers?.some(tm => tm.job_id === j.id && tm.user_id === member.user_id)
      ) || [];
      
      for (const other of otherJobs) {
        const otherStart = new Date(other.start_datetime);
        const otherEnd = new Date(other.end_datetime || other.start_datetime);
        if (
          (start >= otherStart && start < otherEnd) ||
          (end > otherStart && end <= otherEnd) ||
          (start <= otherStart && end >= otherEnd)
        ) {
          hasTeamConflict = true;
          break;
        }
      }
      if (hasTeamConflict) break;
    }

    return { hasResourceConflict, hasTeamConflict };
  };

  // Filter and prepare events
  const events = useMemo(() => {
    if (!jobs) return [];
    
    return jobs
      .filter(job => {
        if (filterStatus !== "all" && job.status !== filterStatus) return false;
        if (filterType !== "all" && job.type !== filterType) return false;
        return true;
      })
      .map(job => {
        const start = new Date(job.start_datetime);
        const end = job.end_datetime 
          ? new Date(job.end_datetime) 
          : new Date(start.getTime() + 2 * 60 * 60 * 1000);
        
        const { hasResourceConflict, hasTeamConflict } = checkConflicts(job.id, start, end);
        const hasConflict = hasResourceConflict || hasTeamConflict;

        return {
          id: job.id,
          title: job.title,
          start,
          end,
          job,
          hasConflict,
          hasResourceConflict,
          hasTeamConflict
        };
      });
  }, [jobs, filterStatus, filterType, jobResources, teamMembers]);

  const handleEventClick = (event: any) => {
    setSelectedJob(event.job);
    setShowJobSheet(true);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsJobDialogOpen(true);
  };

  const jobTypes = useMemo(() => {
    if (!jobs) return [];
    return [...new Set(jobs.map(j => j.type).filter(type => type && type.trim() !== ''))];
  }, [jobs]);

  if (isLoading) {
    return <div className="space-y-6">Carregando...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Header com Gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Agenda</h1>
              <p className="text-white/90 mt-1">Calendário de Trabalho e disponibilidade</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setSelectedDate(new Date());
              setIsJobDialogOpen(true);
            }}
            className="gap-2 bg-white text-primary hover:bg-white/90 shadow-lg"
            size={isMobile ? "default" : "lg"}
          >
            <Plus className="h-5 w-5" />
            Novo Job
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-5 glass hover-lift">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="in_production">Em Produção</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Tipo</label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {jobTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* View Selector */}
      <Card className="p-4 glass hover-lift">
        <div className="flex gap-2">
          <Button
            variant={calendarView === 'month' ? 'default' : 'outline'}
            size="default"
            onClick={() => setCalendarView('month')}
            className="flex-1 h-11 font-medium"
          >
            Mês
          </Button>
          <Button
            variant={calendarView === 'week' ? 'default' : 'outline'}
            size="default"
            onClick={() => setCalendarView('week')}
            className="flex-1 h-11 font-medium"
          >
            Semana
          </Button>
          <Button
            variant={calendarView === 'day' ? 'default' : 'outline'}
            size="default"
            onClick={() => setCalendarView('day')}
            className="flex-1 h-11 font-medium"
          >
            Dia
          </Button>
        </div>
      </Card>

      {/* Calendar */}
      <CustomCalendar
        events={events}
        onEventClick={handleEventClick}
        onDateSelect={handleDateSelect}
        view={calendarView}
      />

      {/* Job Details Sheet */}
      <Sheet open={showJobSheet} onOpenChange={setShowJobSheet}>
        <SheetContent>
          {selectedJob && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedJob.title}</SheetTitle>
                <SheetDescription>
                  {new Date(selectedJob.start_datetime).toLocaleDateString("pt-PT", {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge variant={selectedJob.status === 'confirmed' ? 'success' : 'secondary'}>
                    {selectedJob.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tipo</p>
                  <p className="font-medium">{selectedJob.type}</p>
                </div>
                {selectedJob.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Descrição</p>
                    <p>{selectedJob.description}</p>
                  </div>
                )}
                {selectedJob.location && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Local</p>
                    <p>{selectedJob.location}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cliente</p>
                  <p className="font-medium">{selectedJob.clients?.name || 'Não especificado'}</p>
                </div>
                {checkConflicts(
                  selectedJob.id,
                  new Date(selectedJob.start_datetime),
                  new Date(selectedJob.end_datetime || selectedJob.start_datetime)
                ).hasResourceConflict && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Package className="h-4 w-4 text-destructive mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-destructive">Conflito de Recursos</p>
                        <p className="text-xs text-destructive/80">Equipamentos já alocados neste horário</p>
                      </div>
                    </div>
                  </div>
                )}
                {checkConflicts(
                  selectedJob.id,
                  new Date(selectedJob.start_datetime),
                  new Date(selectedJob.end_datetime || selectedJob.start_datetime)
                ).hasTeamConflict && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-destructive mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-destructive">Conflito de Equipe</p>
                        <p className="text-xs text-destructive/80">Membros da equipe já em outro job</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <JobDialog
        open={isJobDialogOpen}
        onOpenChange={setIsJobDialogOpen}
        initialDate={selectedDate}
      />
    </div>
  );
}
