import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Plus } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { useState } from "react";
import { JobDialog } from "@/components/JobDialog";

export default function CalendarView() {
  const { data: jobs, isLoading } = useJobs();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  
  const currentMonth = currentDate.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });

  // Generate calendar days for current month
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();
  
  const calendarDays = [];
  
  // Add empty days for alignment
  for (let i = 0; i < startDay; i++) {
    const prevMonthDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), -i);
    calendarDays.unshift({ 
      date: prevMonthDay.getDate(), 
      jobs: [], 
      nextMonth: false,
      prevMonth: true 
    });
  }
  
  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayJobs = jobs?.filter(job => {
      const jobDate = new Date(job.start_datetime);
      return jobDate.toDateString() === dayDate.toDateString();
    }).map(job => ({
      title: job.title,
      time: new Date(job.start_datetime).toLocaleTimeString("pt-PT", { hour: '2-digit', minute: '2-digit' }),
      type: job.status
    })) || [];
    
    calendarDays.push({ date: day, jobs: dayJobs, nextMonth: false, prevMonth: false });
  }
  
  const confirmedCount = jobs?.filter(j => j.status === 'confirmed').length || 0;
  const pendingCount = jobs?.filter(j => j.status === 'in_production').length || 0;
  const scheduledCount = jobs?.filter(j => j.status === 'scheduled').length || 0;

  if (isLoading) {
    return <div className="space-y-6">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground mt-1">Calendário de jobs e disponibilidade</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              setSelectedDate(new Date());
              setIsJobDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Job
          </Button>
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Sincronizar Google Calendar
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">{currentMonth}</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Hoje
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
          
          {calendarDays.map((day, index) => {
            const isToday = !day.nextMonth && !day.prevMonth && 
              day.date === new Date().getDate() && 
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();
            
            return (
              <div
                key={index}
                onClick={() => {
                  if (!day.nextMonth && !day.prevMonth) {
                    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date);
                    setSelectedDate(clickedDate);
                    setIsJobDialogOpen(true);
                  }
                }}
                className={`min-h-32 p-2 rounded-lg border cursor-pointer ${
                  day.nextMonth || day.prevMonth
                    ? "border-border/50 bg-muted/20" 
                    : isToday
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                } hover:border-primary/50 transition-colors`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isToday 
                    ? "text-primary font-bold" 
                    : day.nextMonth || day.prevMonth 
                    ? "text-muted-foreground" 
                    : "text-foreground"
                }`}>
                  {day.date}
                </div>
                <div className="space-y-1">
                  {day.jobs.length === 0 && !day.nextMonth && !day.prevMonth && (
                    <div className="text-xs text-muted-foreground/50 italic mt-4">
                      Clique para adicionar
                    </div>
                  )}
                  {day.jobs.map((job, jobIndex) => (
                    <div
                      key={jobIndex}
                      className={`text-xs p-2 rounded ${
                        job.type === "confirmed" 
                          ? "bg-success/10 text-success" 
                          : job.type === "in_production"
                          ? "bg-warning/10 text-warning"
                          : job.type === "scheduled"
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary/10 text-secondary"
                      }`}
                    >
                      <div className="font-medium truncate">{job.title}</div>
                      <div className="opacity-75">{job.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-success" />
            <div>
              <div className="text-sm font-medium text-foreground">Confirmados</div>
              <div className="text-2xl font-bold text-foreground mt-1">{confirmedCount}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-warning" />
            <div>
              <div className="text-sm font-medium text-foreground">Em Produção</div>
              <div className="text-2xl font-bold text-foreground mt-1">{pendingCount}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <div>
              <div className="text-sm font-medium text-foreground">Agendados</div>
              <div className="text-2xl font-bold text-foreground mt-1">{scheduledCount}</div>
            </div>
          </div>
        </Card>
      </div>

      <JobDialog 
        open={isJobDialogOpen} 
        onOpenChange={setIsJobDialogOpen}
        initialDate={selectedDate}
      />
    </div>
  );
}
