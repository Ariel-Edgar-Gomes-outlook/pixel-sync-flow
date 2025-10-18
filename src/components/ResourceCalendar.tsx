import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { pt } from "date-fns/locale";
import { useState } from "react";

interface ResourceReservation {
  id: string;
  resource_id: string;
  job_id: string;
  reserved_from: string;
  reserved_until: string;
  notes: string | null;
  jobs: {
    title: string;
    location: string | null;
  };
  resources: {
    name: string;
    type: string;
  };
}

export function ResourceCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const { data: reservations, isLoading } = useQuery({
    queryKey: ['resource_reservations', format(monthStart, 'yyyy-MM'), format(monthEnd, 'yyyy-MM')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_resources')
        .select(`
          *,
          jobs (
            title,
            location
          ),
          resources (
            name,
            type
          )
        `)
        .gte('reserved_from', monthStart.toISOString())
        .lte('reserved_until', monthEnd.toISOString())
        .order('reserved_from', { ascending: true });

      if (error) throw error;
      return data as ResourceReservation[];
    },
  });

  const getReservationsForDate = (date: Date) => {
    if (!reservations) return [];
    return reservations.filter(res => {
      const from = parseISO(res.reserved_from);
      const until = parseISO(res.reserved_until);
      return date >= from && date <= until;
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando calendário...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Calendário de Reservas</CardTitle>
              <CardDescription>Visualize reservas de recursos por mês</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
            >
              Próximo
            </Button>
          </div>
        </div>
        <div className="text-center mt-4">
          <h3 className="text-2xl font-semibold">
            {format(selectedDate, 'MMMM yyyy', { locale: pt })}
          </h3>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center font-semibold text-sm text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map(day => {
            const dayReservations = getReservationsForDate(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toString()}
                className={`min-h-[100px] p-2 border rounded-lg ${
                  isToday ? 'border-primary bg-primary/5' : 'border-border'
                } ${dayReservations.length > 0 ? 'bg-accent/20' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                  {format(day, 'd')}
                </div>
                
                <ScrollArea className="h-[70px]">
                  <div className="space-y-1">
                    {dayReservations.map(res => (
                      <div
                        key={res.id}
                        className="text-xs p-1 rounded bg-primary/10 border border-primary/20"
                      >
                        <div className="font-medium truncate">{res.resources.name}</div>
                        <div className="text-muted-foreground truncate">{res.jobs.title}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>

        {reservations && reservations.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Detalhes das Reservas</h4>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {reservations.map(res => (
                  <Card key={res.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="primary">{res.resources.type}</Badge>
                          <span className="font-semibold">{res.resources.name}</span>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-3 w-3" />
                            {format(parseISO(res.reserved_from), "d 'de' MMMM 'às' HH:mm", { locale: pt })}
                            {' → '}
                            {format(parseISO(res.reserved_until), "d 'de' MMMM 'às' HH:mm", { locale: pt })}
                          </div>
                        </div>

                        <div className="text-sm">
                          <span className="font-medium">Job:</span> {res.jobs.title}
                        </div>

                        {res.jobs.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {res.jobs.location}
                          </div>
                        )}

                        {res.notes && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Notas:</span> {res.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {(!reservations || reservations.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma reserva de recurso neste mês</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
