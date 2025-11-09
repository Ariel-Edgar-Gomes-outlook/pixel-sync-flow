import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronLeft, ChevronRight, Users, Package } from "lucide-react";
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { pt } from "date-fns/locale";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  job: any;
  hasConflict?: boolean;
  hasResourceConflict?: boolean;
  hasTeamConflict?: boolean;
}

interface CustomCalendarProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateSelect: (date: Date) => void;
  view: 'month' | 'week' | 'day';
}

export function CustomCalendar({ events, onEventClick, onDateSelect, view }: CustomCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInView = () => {
    if (view === 'month') {
      const start = startOfWeek(startOfMonth(currentDate), { locale: pt });
      const end = endOfWeek(endOfMonth(currentDate), { locale: pt });
      return eachDayOfInterval({ start, end });
    } else if (view === 'week') {
      const start = startOfWeek(currentDate, { locale: pt });
      const end = endOfWeek(currentDate, { locale: pt });
      return eachDayOfInterval({ start, end });
    } else {
      return [currentDate];
    }
  };

  const days = getDaysInView();

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return isSameDay(eventStart, day) || 
             (eventStart <= day && eventEnd >= day);
    });
  };

  const handlePrevious = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusColor = (job: any) => {
    if (job.status === 'confirmed') return 'bg-green-500';
    if (job.status === 'in_production') return 'bg-orange-500';
    return 'bg-blue-500';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleToday}>
            Hoje
          </Button>
        </div>
        <h2 className="text-xl font-semibold capitalize">
          {format(currentDate, view === 'day' ? 'dd MMMM yyyy' : 'MMMM yyyy', { locale: pt })}
        </h2>
      </div>

      {/* Calendar Grid */}
      {view === 'month' && (
        <Card className="p-4">
          <div className="grid grid-cols-7 gap-1">
            {/* Weekday headers */}
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                {day}
              </div>
            ))}
            
            {/* Days */}
            {days.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isDayToday = isToday(day);
              
              return (
                <div
                  key={idx}
                  className={`min-h-[100px] border border-border p-2 cursor-pointer transition-colors hover:bg-muted/50 ${
                    !isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''
                  } ${isDayToday ? 'bg-primary/10 border-primary' : ''}`}
                  onClick={() => onDateSelect(day)}
                >
                  <div className="font-medium text-sm mb-1">{format(day, 'd')}</div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded cursor-pointer ${getStatusColor(event.job)} text-white truncate`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        {event.hasConflict && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Week View */}
      {view === 'week' && (
        <Card className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              const isDayToday = isToday(day);
              
              return (
                <div key={idx} className="space-y-2">
                  <div className={`text-center font-semibold p-2 rounded ${isDayToday ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <div className="text-xs">{format(day, 'EEE', { locale: pt })}</div>
                    <div className="text-lg">{format(day, 'd')}</div>
                  </div>
                  <div className="space-y-2 min-h-[400px]" onClick={() => onDateSelect(day)}>
                    {dayEvents.map((event) => (
                      <Card
                        key={event.id}
                        className={`p-2 cursor-pointer ${getStatusColor(event.job)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        <div className="text-xs text-white font-medium">
                          {event.hasConflict && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                          {format(new Date(event.start), 'HH:mm')}
                        </div>
                        <div className="text-sm text-white truncate">{event.title}</div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Day View */}
      {view === 'day' && (
        <Card className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 24 }, (_, hour) => {
              const hourEvents = events.filter(event => {
                const eventStart = new Date(event.start);
                return isSameDay(eventStart, currentDate) && eventStart.getHours() === hour;
              });

              return (
                <div key={hour} className="flex gap-4 border-b border-border pb-4">
                  <div className="w-20 text-sm text-muted-foreground font-medium">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  <div className="flex-1 space-y-2">
                    {hourEvents.map((event) => (
                      <Card
                        key={event.id}
                        className={`p-3 cursor-pointer ${getStatusColor(event.job)}`}
                        onClick={() => onEventClick(event)}
                      >
                        <div className="flex items-center gap-2">
                          {event.hasConflict && <AlertTriangle className="h-4 w-4 text-white" />}
                          <div>
                            <div className="font-medium text-white">{event.title}</div>
                            <div className="text-xs text-white/80">
                              {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Empty state */}
      {events.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Sem eventos para este período</p>
        </Card>
      )}
    </div>
  );
}
