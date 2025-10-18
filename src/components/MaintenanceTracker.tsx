import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wrench, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, isPast, differenceInDays } from "date-fns";
import { pt } from "date-fns/locale";

interface Resource {
  id: string;
  name: string;
  type: string;
  status: string;
  location: string | null;
  next_maintenance_date: string | null;
  manual_link: string | null;
}

export function MaintenanceTracker() {
  const { data: resources, isLoading } = useQuery({
    queryKey: ['resources_maintenance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('next_maintenance_date', { ascending: true });

      if (error) throw error;
      return data as Resource[];
    },
  });

  const getMaintenanceStatus = (date: string | null) => {
    if (!date) return { status: 'unknown', label: 'Sem data', days: null };
    
    const maintenanceDate = parseISO(date);
    const today = new Date();
    const daysUntil = differenceInDays(maintenanceDate, today);

    if (daysUntil < 0) {
      return { status: 'overdue', label: 'Atrasada', days: Math.abs(daysUntil) };
    } else if (daysUntil <= 7) {
      return { status: 'urgent', label: 'Urgente', days: daysUntil };
    } else if (daysUntil <= 30) {
      return { status: 'upcoming', label: 'Próxima', days: daysUntil };
    } else {
      return { status: 'scheduled', label: 'Agendada', days: daysUntil };
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'destructive';
      case 'urgent':
        return 'warning';
      case 'upcoming':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando manutenções...</div>;
  }

  const resourcesWithMaintenance = resources?.filter(r => r.next_maintenance_date) || [];
  const overdueResources = resourcesWithMaintenance.filter(r => 
    getMaintenanceStatus(r.next_maintenance_date).status === 'overdue'
  );
  const urgentResources = resourcesWithMaintenance.filter(r => 
    getMaintenanceStatus(r.next_maintenance_date).status === 'urgent'
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Wrench className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Tracking de Manutenção</CardTitle>
            <CardDescription>Monitorize manutenções pendentes e agendadas</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-destructive/10 border-destructive/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Atrasadas</p>
                  <p className="text-3xl font-bold text-destructive">{overdueResources.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-warning/10 border-warning/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Urgentes (7 dias)</p>
                  <p className="text-3xl font-bold text-warning">{urgentResources.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-success/10 border-success/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Agendadas</p>
                  <p className="text-3xl font-bold text-success">{resourcesWithMaintenance.length}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {resourcesWithMaintenance.length > 0 ? (
              resourcesWithMaintenance.map(resource => {
                const maintenanceStatus = getMaintenanceStatus(resource.next_maintenance_date);
                
                return (
                  <Card key={resource.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{resource.type}</Badge>
                          <Badge variant={getStatusBadgeVariant(maintenanceStatus.status)}>
                            {maintenanceStatus.label}
                          </Badge>
                          <span className="font-semibold">{resource.name}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {resource.next_maintenance_date && 
                              format(parseISO(resource.next_maintenance_date), "d 'de' MMMM 'de' yyyy", { locale: pt })
                            }
                          </span>
                          {maintenanceStatus.days !== null && (
                            <span className="font-medium">
                              ({maintenanceStatus.days} {maintenanceStatus.days === 1 ? 'dia' : 'dias'})
                            </span>
                          )}
                        </div>

                        {resource.location && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Localização:</span> {resource.location}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={resource.status === 'available' ? 'success' : 'secondary'}
                          >
                            {resource.status === 'available' ? 'Disponível' : 
                             resource.status === 'in_use' ? 'Em Uso' : 'Manutenção'}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {resource.manual_link && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={resource.manual_link} target="_blank" rel="noopener noreferrer">
                              Manual
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma manutenção agendada</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
