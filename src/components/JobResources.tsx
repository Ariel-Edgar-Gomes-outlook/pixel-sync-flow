import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useResources } from "@/hooks/useResources";
import { toast } from "sonner";
import { Wrench, Plus, X, AlertCircle, Calendar } from "lucide-react";
import { format } from "date-fns";

interface JobResourcesProps {
  jobId: string;
  startDatetime: string;
  endDatetime: string | null;
}

interface JobResource {
  id: string;
  resource_id: string;
  reserved_from: string;
  reserved_until: string;
  notes: string | null;
  resources: {
    id: string;
    name: string;
    type: string;
    status: string;
  };
}

export function JobResources({ jobId, startDatetime, endDatetime }: JobResourcesProps) {
  const [selectedResource, setSelectedResource] = useState("");
  const [reservationNotes, setReservationNotes] = useState("");
  const [reservedFrom, setReservedFrom] = useState(startDatetime ? new Date(startDatetime).toISOString().slice(0, 16) : "");
  const [reservedUntil, setReservedUntil] = useState(endDatetime ? new Date(endDatetime).toISOString().slice(0, 16) : "");

  const queryClient = useQueryClient();
  const { data: allResources } = useResources();

  // Fetch job resources
  const { data: jobResources } = useQuery({
    queryKey: ['job_resources', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_resources')
        .select(`
          *,
          resources (
            id,
            name,
            type,
            status
          )
        `)
        .eq('job_id', jobId);

      if (error) throw error;
      return data as JobResource[];
    },
  });

  // Add resource mutation
  const addResourceMutation = useMutation({
    mutationFn: async () => {
      if (!selectedResource) {
        throw new Error("Selecione um equipamento");
      }

      const { error } = await supabase
        .from('job_resources')
        .insert({
          job_id: jobId,
          resource_id: selectedResource,
          reserved_from: reservedFrom,
          reserved_until: reservedUntil,
          notes: reservationNotes || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_resources', jobId] });
      toast.success("Equipamento adicionado com sucesso!");
      setSelectedResource("");
      setReservationNotes("");
    },
    onError: (error: any) => {
      if (error.message?.includes('already booked')) {
        toast.error("Equipamento já reservado para este período");
      } else {
        toast.error("Erro ao adicionar equipamento");
      }
      console.error(error);
    },
  });

  // Remove resource mutation
  const removeResourceMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      const { error } = await supabase
        .from('job_resources')
        .delete()
        .eq('id', resourceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_resources', jobId] });
      toast.success("Equipamento removido");
    },
    onError: (error) => {
      toast.error("Erro ao remover equipamento");
      console.error(error);
    },
  });

  const availableResources = allResources?.filter(
    resource => !jobResources?.some(jr => jr.resource_id === resource.id)
  ) || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Adicionar Equipamento */}
      <Card className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-semibold text-foreground">Adicionar Equipamento</h3>
            <p className="text-xs text-muted-foreground">Reserve equipamentos para este job</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resource" className="text-sm font-medium">
              Equipamento <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedResource} onValueChange={setSelectedResource}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Selecione um equipamento" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {availableResources.map((resource) => (
                  <SelectItem key={resource.id} value={resource.id}>
                    {resource.name} - {resource.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableResources.length === 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Todos os equipamentos já foram adicionados
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reserved_from" className="text-sm font-medium">
                Reservado De
              </Label>
              <Input
                id="reserved_from"
                type="datetime-local"
                value={reservedFrom}
                onChange={(e) => setReservedFrom(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reserved_until" className="text-sm font-medium">
                Reservado Até
              </Label>
              <Input
                id="reserved_until"
                type="datetime-local"
                value={reservedUntil}
                onChange={(e) => setReservedUntil(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notas (Opcional)
            </Label>
            <Textarea
              id="notes"
              value={reservationNotes}
              onChange={(e) => setReservationNotes(e.target.value)}
              placeholder="Ex: Verificar bateria extra, limpar lente antes do uso..."
              className="bg-background"
              rows={2}
            />
          </div>

          <Button
            onClick={() => addResourceMutation.mutate()}
            disabled={!selectedResource || addResourceMutation.isPending}
            className="w-full h-10 sm:h-11"
          >
            {addResourceMutation.isPending ? "Adicionando..." : "Adicionar Equipamento"}
          </Button>
        </div>
      </Card>

      {/* Lista de Equipamentos */}
      <Card className="p-3 sm:p-4 lg:p-6 bg-muted/50">
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Wrench className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-semibold text-foreground">Equipamentos Reservados</h3>
            <p className="text-xs text-muted-foreground">Lista de equipamentos para este job</p>
          </div>
        </div>

        {!jobResources || jobResources.length === 0 ? (
          <div className="text-center py-6 sm:py-8 border-2 border-dashed rounded-lg">
            <Wrench className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
            <p className="text-xs sm:text-sm text-muted-foreground">Nenhum equipamento reservado ainda</p>
            <p className="text-xs text-muted-foreground mt-1">Adicione equipamentos necessários para este job</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {jobResources.map((jobResource) => (
              <Card key={jobResource.id} className="p-3 sm:p-4 bg-background hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {jobResource.resources.type}
                      </Badge>
                      <span className="font-semibold text-sm text-foreground truncate">
                        {jobResource.resources.name}
                      </span>
                      <Badge
                        variant={
                          jobResource.resources.status === 'available' ? 'success' :
                          jobResource.resources.status === 'in_use' ? 'warning' :
                          'secondary'
                        }
                        className="text-xs flex-shrink-0"
                      >
                        {jobResource.resources.status === 'available' ? '✅ Disponível' :
                         jobResource.resources.status === 'in_use' ? '🔄 Em Uso' :
                         jobResource.resources.status === 'maintenance' ? '🔧 Manutenção' :
                         '❌ Indisponível'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        {format(new Date(jobResource.reserved_from), "dd/MM/yyyy HH:mm")}
                        {' → '}
                        {format(new Date(jobResource.reserved_until), "dd/MM/yyyy HH:mm")}
                      </span>
                    </div>

                    {jobResource.notes && (
                      <p className="text-xs sm:text-sm text-muted-foreground break-words">
                        <span className="font-medium">Notas:</span> {jobResource.notes}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
                    onClick={() => removeResourceMutation.mutate(jobResource.id)}
                    disabled={removeResourceMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Resumo */}
      {jobResources && jobResources.length > 0 && (
        <Card className="p-3 sm:p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-foreground">Total de Equipamentos</p>
              <p className="text-xl sm:text-2xl font-bold text-primary mt-1">
                {jobResources.length}
              </p>
            </div>
            <Wrench className="h-10 w-10 sm:h-12 sm:w-12 text-primary/30" />
          </div>
        </Card>
      )}
    </div>
  );
}