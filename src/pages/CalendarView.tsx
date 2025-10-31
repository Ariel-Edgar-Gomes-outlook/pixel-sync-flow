import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Plus, AlertTriangle, Users, Package, Check } from "lucide-react";
import { useJobs, useUpdateJob } from "@/hooks/useJobs";
import { useState, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { JobDialog } from "@/components/JobDialog";
import { GoogleCalendarIntegration } from "@/components/GoogleCalendarIntegration";
import { toast } from "sonner";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
export default function CalendarView() {
  const {
    data: jobs,
    isLoading
  } = useJobs();
  const updateJob = useUpdateJob();
  const isMobile = useIsMobile();
  const {
    user
  } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showJobSheet, setShowJobSheet] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showGoogleDialog, setShowGoogleDialog] = useState(false);
  const [mobileView, setMobileView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');

  // Fetch resources to check conflicts
  const {
    data: jobResources
  } = useQuery({
    queryKey: ['all_job_resources'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('job_resources').select('*');
      if (error) throw error;
      return data;
    }
  });
  const {
    data: teamMembers
  } = useQuery({
    queryKey: ['all_team_members'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('job_team_members').select('*');
      if (error) throw error;
      return data;
    }
  });

  // Check Google Calendar integration status
  const {
    data: googleIntegration
  } = useQuery({
    queryKey: ['calendar_integration', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const {
        data,
        error
      } = await supabase.from('calendar_integrations').select('*').eq('user_id', user.id).eq('provider', 'google').eq('is_active', true).maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Check for conflicts
  const checkConflicts = (jobId: string, start: Date, end: Date) => {
    const jobResourcesList = jobResources?.filter(jr => jr.job_id === jobId) || [];
    const jobTeamList = teamMembers?.filter(tm => tm.job_id === jobId) || [];
    let hasResourceConflict = false;
    let hasTeamConflict = false;

    // Check resource conflicts
    for (const resource of jobResourcesList) {
      const otherJobs = jobResources?.filter(jr => jr.resource_id === resource.resource_id && jr.job_id !== jobId) || [];
      for (const other of otherJobs) {
        const otherStart = new Date(other.reserved_from);
        const otherEnd = new Date(other.reserved_until);
        if (start >= otherStart && start < otherEnd || end > otherStart && end <= otherEnd || start <= otherStart && end >= otherEnd) {
          hasResourceConflict = true;
          break;
        }
      }
      if (hasResourceConflict) break;
    }

    // Check team conflicts
    for (const member of jobTeamList) {
      const otherJobs = jobs?.filter(j => j.id !== jobId && teamMembers?.some(tm => tm.job_id === j.id && tm.user_id === member.user_id)) || [];
      for (const other of otherJobs) {
        const otherStart = new Date(other.start_datetime);
        const otherEnd = new Date(other.end_datetime || other.start_datetime);
        if (start >= otherStart && start < otherEnd || end > otherStart && end <= otherEnd || start <= otherStart && end >= otherEnd) {
          hasTeamConflict = true;
          break;
        }
      }
      if (hasTeamConflict) break;
    }
    return {
      hasResourceConflict,
      hasTeamConflict
    };
  };

  // Filter and prepare events
  const events = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter(job => {
      if (filterStatus !== "all" && job.status !== filterStatus) return false;
      if (filterType !== "all" && job.type !== filterType) return false;
      return true;
    }).map(job => {
      const start = new Date(job.start_datetime);
      const end = job.end_datetime ? new Date(job.end_datetime) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
      const {
        hasResourceConflict,
        hasTeamConflict
      } = checkConflicts(job.id, start, end);
      const hasConflict = hasResourceConflict || hasTeamConflict;
      return {
        id: job.id,
        title: job.title,
        start: start.toISOString(),
        end: end.toISOString(),
        backgroundColor: hasConflict ? 'hsl(0 84% 60%)' : job.status === 'confirmed' ? 'hsl(142 71% 45%)' : job.status === 'in_production' ? 'hsl(38 92% 50%)' : 'hsl(221 83% 53%)',
        borderColor: hasConflict ? 'hsl(0 84% 50%)' : job.status === 'confirmed' ? 'hsl(142 71% 35%)' : job.status === 'in_production' ? 'hsl(38 92% 40%)' : 'hsl(221 83% 43%)',
        extendedProps: {
          job,
          hasConflict,
          hasResourceConflict,
          hasTeamConflict
        }
      };
    });
  }, [jobs, filterStatus, filterType, jobResources, teamMembers]);
  const handleEventDrop = async (info: any) => {
    const job = info.event.extendedProps.job;
    const newStart = info.event.start;
    const duration = job.end_datetime ? new Date(job.end_datetime).getTime() - new Date(job.start_datetime).getTime() : 2 * 60 * 60 * 1000;
    const newEnd = new Date(newStart.getTime() + duration);
    try {
      await updateJob.mutateAsync({
        id: job.id,
        start_datetime: newStart.toISOString(),
        end_datetime: newEnd.toISOString()
      });
      toast.success("Job reagendado com sucesso!");
    } catch (error) {
      info.revert();
      toast.error("Erro ao reagendar job");
    }
  };
  const handleEventClick = (info: any) => {
    setSelectedJob(info.event.extendedProps.job);
    setShowJobSheet(true);
  };
  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(selectInfo.start);
    setIsJobDialogOpen(true);
  };
  const jobTypes = useMemo(() => {
    if (!jobs) return [];
    return [...new Set(jobs.map(j => j.type).filter(type => type && type.trim() !== ''))];
  }, [jobs]);
  if (isLoading) {
    return <div className="space-y-6">Carregando...</div>;
  }
  return <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Calendário de Trabalho e disponibilidade</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => {
          setSelectedDate(new Date());
          setIsJobDialogOpen(true);
        }} className="gap-2 flex-1 sm:flex-none" size={isMobile ? "sm" : "default"}>
            <Plus className="h-4 w-4" />
            {!isMobile && "Novo Job"}
          </Button>
          <Button variant={googleIntegration ? "default" : "outline"} className="gap-2 flex-1 sm:flex-none relative" size={isMobile ? "sm" : "default"} onClick={() => setShowGoogleDialog(true)}>
            {googleIntegration && <Badge variant="default" className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-green-500 hover:bg-green-600">
                <Check className="h-3 w-3" />
              </Badge>}
            <Calendar className="h-4 w-4" />
            {!isMobile && (googleIntegration ? "Google Calendar" : "Conectar Google")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
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
          <div className="flex-1 min-w-[200px]">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {jobTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Mobile View Selector */}
      {isMobile && <Card className="p-3">
          <div className="flex gap-2">
            <Button variant={mobileView === 'dayGridMonth' ? 'default' : 'outline'} size="sm" onClick={() => setMobileView('dayGridMonth')} className="flex-1">
              Mês
            </Button>
            <Button variant={mobileView === 'timeGridWeek' ? 'default' : 'outline'} size="sm" onClick={() => setMobileView('timeGridWeek')} className="flex-1">
              Semana
            </Button>
            <Button variant={mobileView === 'timeGridDay' ? 'default' : 'outline'} size="sm" onClick={() => setMobileView('timeGridDay')} className="flex-1">
              Dia
            </Button>
          </div>
        </Card>}

      {/* Calendar */}
      <Card className="p-2 sm:p-6 overflow-hidden">
        <FullCalendar plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} initialView={isMobile ? mobileView : "dayGridMonth"} headerToolbar={isMobile ? {
        left: 'prev,next',
        center: 'title',
        right: 'today'
      } : {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      }} titleFormat={isMobile ? mobileView === 'dayGridMonth' ? {
        month: 'short',
        year: 'numeric'
      } : {
        month: 'short',
        day: 'numeric'
      } : {
        month: 'long',
        year: 'numeric'
      }} locale="pt" events={events} editable={!isMobile} droppable={!isMobile} selectable={true} selectMirror={true} dayMaxEvents={isMobile && mobileView === 'dayGridMonth' ? 2 : true} weekends={true} eventDrop={handleEventDrop} eventClick={handleEventClick} select={handleDateSelect} height="auto" contentHeight={isMobile ? mobileView === 'dayGridMonth' ? 400 : 500 : "auto"} aspectRatio={isMobile ? mobileView === 'dayGridMonth' ? 1.2 : 1 : 1.35} eventContent={arg => <div className="p-1 text-xs overflow-hidden">
              {arg.event.extendedProps.hasConflict && <AlertTriangle className="h-3 w-3 inline mr-1" />}
              <span className="font-medium truncate">{arg.event.title}</span>
            </div>} />
      </Card>

      {/* Job Details Sheet */}
      <Sheet open={showJobSheet} onOpenChange={setShowJobSheet}>
        <SheetContent>
          {selectedJob && <>
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
                {selectedJob.description && <div>
                    <p className="text-sm text-muted-foreground mb-1">Descrição</p>
                    <p>{selectedJob.description}</p>
                  </div>}
                {selectedJob.location && <div>
                    <p className="text-sm text-muted-foreground mb-1">Local</p>
                    <p>{selectedJob.location}</p>
                  </div>}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cliente</p>
                  <p className="font-medium">{selectedJob.clients?.name || 'Não especificado'}</p>
                </div>
                {checkConflicts(selectedJob.id, new Date(selectedJob.start_datetime), new Date(selectedJob.end_datetime || selectedJob.start_datetime)).hasResourceConflict && <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Package className="h-4 w-4 text-destructive mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-destructive">Conflito de Recursos</p>
                        <p className="text-xs text-destructive/80">Equipamentos já alocados neste horário</p>
                      </div>
                    </div>
                  </div>}
                {checkConflicts(selectedJob.id, new Date(selectedJob.start_datetime), new Date(selectedJob.end_datetime || selectedJob.start_datetime)).hasTeamConflict && <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-destructive mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-destructive">Conflito de Equipe</p>
                        <p className="text-xs text-destructive/80">Membros da equipe já em outro job</p>
                      </div>
                    </div>
                  </div>}
                <Button onClick={() => {
              setShowJobSheet(false);
              // Open edit dialog
            }} className="w-full">
                  Editar Job
                </Button>
              </div>
            </>}
        </SheetContent>
      </Sheet>

      <JobDialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen} initialDate={selectedDate} />

      {/* Google Calendar Integration Dialog */}
      <Dialog open={showGoogleDialog} onOpenChange={setShowGoogleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Integração com Google Calendar</DialogTitle>
            <DialogDescription>
              Sincronize seus jobs automaticamente com o Google Calendar
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {user?.id && <GoogleCalendarIntegration userId={user.id} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>;
}