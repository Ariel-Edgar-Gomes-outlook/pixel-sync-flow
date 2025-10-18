import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const currentMonth = "Outubro 2025";

const calendarDays = [
  { date: 20, jobs: [] },
  { date: 21, jobs: [] },
  { date: 22, jobs: [] },
  { date: 23, jobs: [] },
  { date: 24, jobs: [] },
  { date: 25, jobs: [{ title: "Casamento Silva", time: "14:00", type: "confirmed" }] },
  { date: 26, jobs: [{ title: "Sessão Família", time: "10:00", type: "confirmed" }] },
  { date: 27, jobs: [] },
  { date: 28, jobs: [{ title: "Evento TechStart", time: "18:00", type: "pending" }] },
  { date: 29, jobs: [] },
  { date: 30, jobs: [] },
  { date: 31, jobs: [] },
  { date: 1, jobs: [], nextMonth: true },
  { date: 2, jobs: [{ title: "Produto Fashion", time: "09:00", type: "scheduled" }], nextMonth: true },
];

export default function CalendarView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground mt-1">Calendário de jobs e disponibilidade</p>
        </div>
        <Button className="gap-2">
          <Calendar className="h-4 w-4" />
          Sincronizar Google Calendar
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">{currentMonth}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              Hoje
            </Button>
            <Button variant="outline" size="sm">
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
          
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-32 p-2 rounded-lg border ${
                day.nextMonth 
                  ? "border-border/50 bg-muted/20" 
                  : "border-border bg-card"
              } hover:border-primary/50 transition-colors`}
            >
              <div className={`text-sm font-medium mb-2 ${
                day.nextMonth ? "text-muted-foreground" : "text-foreground"
              }`}>
                {day.date}
              </div>
              <div className="space-y-1">
                {day.jobs.map((job, jobIndex) => (
                  <div
                    key={jobIndex}
                    className={`text-xs p-2 rounded ${
                      job.type === "confirmed" 
                        ? "bg-success/10 text-success" 
                        : job.type === "pending"
                        ? "bg-warning/10 text-warning"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <div className="font-medium truncate">{job.title}</div>
                    <div className="opacity-75">{job.time}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-success" />
            <div>
              <div className="text-sm font-medium text-foreground">Confirmados</div>
              <div className="text-2xl font-bold text-foreground mt-1">12</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-warning" />
            <div>
              <div className="text-sm font-medium text-foreground">Pendentes</div>
              <div className="text-2xl font-bold text-foreground mt-1">5</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <div>
              <div className="text-sm font-medium text-foreground">Agendados</div>
              <div className="text-2xl font-bold text-foreground mt-1">8</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
