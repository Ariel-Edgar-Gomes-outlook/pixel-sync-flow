import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock, 
  FileText,
  Users,
  Image,
  Package,
  CheckSquare,
  Timer,
  CreditCard,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useJob } from "@/hooks/useJobs";
import { TeamManagement } from "./TeamManagement";
import { JobDeliverables } from "./JobDeliverables";
import { JobResources } from "./JobResources";
import { ChecklistManager } from "./ChecklistManager";
import { TimeTracker } from "./TimeTracker";
import { JobGalleryTab } from "./JobGalleryTab";
import { PaymentPlanViewer } from "./PaymentPlanViewer";

interface JobDetailsDialogProps {
  jobId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  scheduled: { label: "Agendado", variant: "secondary" as const },
  in_progress: { label: "Em Progresso", variant: "default" as const },
  completed: { label: "Concluído", variant: "outline" as const },
  cancelled: { label: "Cancelado", variant: "destructive" as const },
  confirmed: { label: "Confirmado", variant: "default" as const },
  in_production: { label: "Em Produção", variant: "default" as const },
  delivery_pending: { label: "Entrega Pendente", variant: "default" as const },
};

export function JobDetailsDialog({ jobId, open, onOpenChange }: JobDetailsDialogProps) {
  const { data: job, isLoading } = useJob(jobId);

  if (isLoading || !job) {
    return null;
  }

  const statusInfo = statusConfig[job.status as keyof typeof statusConfig] || statusConfig.scheduled;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-primary" />
              <DialogTitle className="text-2xl">{job.title}</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              <Badge variant="outline">{job.type}</Badge>
            </div>
          </div>
          {job.clients && (
            <p className="text-sm text-muted-foreground">
              Cliente: {job.clients.name}
            </p>
          )}
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="details" className="text-xs">
              <FileText className="h-4 w-4 mr-1" />
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="team" className="text-xs">
              <Users className="h-4 w-4 mr-1" />
              Equipa
            </TabsTrigger>
            <TabsTrigger value="time" className="text-xs">
              <Timer className="h-4 w-4 mr-1" />
              Tempo
            </TabsTrigger>
            <TabsTrigger value="deliverables" className="text-xs">
              <Image className="h-4 w-4 mr-1" />
              Entregáveis
            </TabsTrigger>
            <TabsTrigger value="gallery" className="text-xs">
              <Image className="h-4 w-4 mr-1" />
              Galeria
            </TabsTrigger>
            <TabsTrigger value="equipment" className="text-xs">
              <Package className="h-4 w-4 mr-1" />
              Equipamentos
            </TabsTrigger>
            <TabsTrigger value="checklist" className="text-xs">
              <CheckSquare className="h-4 w-4 mr-1" />
              Checklist
            </TabsTrigger>
            <TabsTrigger value="payment" className="text-xs">
              <CreditCard className="h-4 w-4 mr-1" />
              Pagamento
            </TabsTrigger>
          </TabsList>

          {/* Detalhes Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date & Time */}
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium mb-1">Data e Hora</p>
                    <p className="text-sm text-muted-foreground">
                      Início: {format(new Date(job.start_datetime), "PPp", { locale: ptBR })}
                    </p>
                    {job.end_datetime && (
                      <p className="text-sm text-muted-foreground">
                        Fim: {format(new Date(job.end_datetime), "PPp", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Location */}
              {job.location && (
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium mb-1">Local</p>
                      <p className="text-sm text-muted-foreground">{job.location}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Revenue */}
              {job.estimated_revenue && (
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium mb-1">Receita Estimada</p>
                      <p className="text-sm text-muted-foreground">
                        {new Intl.NumberFormat('pt-AO', {
                          style: 'currency',
                          currency: 'AOA'
                        }).format(Number(job.estimated_revenue))}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Cost */}
              {job.estimated_cost && (
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium mb-1">Custo Estimado</p>
                      <p className="text-sm text-muted-foreground">
                        {new Intl.NumberFormat('pt-AO', {
                          style: 'currency',
                          currency: 'AOA'
                        }).format(Number(job.estimated_cost))}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Hours */}
              {job.estimated_hours && (
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium mb-1">Horas Estimadas</p>
                      <p className="text-sm text-muted-foreground">{job.estimated_hours}h</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Time Spent */}
              {job.time_spent !== undefined && (
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <Timer className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium mb-1">Tempo Gasto</p>
                      <p className="text-sm text-muted-foreground">{job.time_spent}h</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Description */}
            {job.description && (
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium mb-2">Descrição</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {job.description}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
              <Card className="p-4">
                <p className="font-medium mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="mt-4">
            <TeamManagement jobId={jobId} />
          </TabsContent>

          {/* Time Tracking Tab */}
          <TabsContent value="time" className="mt-4">
            <TimeTracker jobId={jobId} />
          </TabsContent>

          {/* Deliverables Tab */}
          <TabsContent value="deliverables" className="mt-4">
            <JobDeliverables jobId={jobId} />
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="mt-4">
            <JobGalleryTab jobId={jobId} />
          </TabsContent>

          {/* Equipment Tab */}
          <TabsContent value="equipment" className="mt-4">
            <JobResources 
              jobId={jobId} 
              startDatetime={job.start_datetime}
              endDatetime={job.end_datetime}
            />
          </TabsContent>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="mt-4">
            <ChecklistManager jobId={jobId} />
          </TabsContent>

          {/* Payment Plan Tab */}
          <TabsContent value="payment" className="mt-4">
            <PaymentPlanViewer jobId={jobId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
