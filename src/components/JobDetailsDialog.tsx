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
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-5xl max-h-[90vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
              <DialogTitle className="text-lg sm:text-xl lg:text-2xl line-clamp-2">{job.title}</DialogTitle>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant={statusInfo.variant} className="text-xs">{statusInfo.label}</Badge>
              <Badge variant="outline" className="text-xs">{job.type}</Badge>
            </div>
          </div>
          {job.clients && (
            <p className="text-sm text-muted-foreground">
              Cliente: {job.clients.name}
            </p>
          )}
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="inline-flex w-full sm:w-auto overflow-x-auto flex-nowrap justify-start sm:justify-center h-auto p-1 gap-1">
            <TabsTrigger value="details" className="text-xs sm:text-sm flex-shrink-0 px-2 sm:px-3 py-2">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="whitespace-nowrap">Detalhes</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="text-xs sm:text-sm flex-shrink-0 px-2 sm:px-3 py-2">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="whitespace-nowrap">Equipa</span>
            </TabsTrigger>
            <TabsTrigger value="time" className="text-xs sm:text-sm flex-shrink-0 px-2 sm:px-3 py-2">
              <Timer className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="whitespace-nowrap">Tempo</span>
            </TabsTrigger>
            <TabsTrigger value="deliverables" className="text-xs sm:text-sm flex-shrink-0 px-2 sm:px-3 py-2">
              <Image className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="whitespace-nowrap">Entregáveis</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="text-xs sm:text-sm flex-shrink-0 px-2 sm:px-3 py-2">
              <Image className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="whitespace-nowrap">Galeria</span>
            </TabsTrigger>
            <TabsTrigger value="equipment" className="text-xs sm:text-sm flex-shrink-0 px-2 sm:px-3 py-2">
              <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="whitespace-nowrap">Equipamentos</span>
            </TabsTrigger>
            <TabsTrigger value="checklist" className="text-xs sm:text-sm flex-shrink-0 px-2 sm:px-3 py-2">
              <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="whitespace-nowrap">Checklist</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="text-xs sm:text-sm flex-shrink-0 px-2 sm:px-3 py-2">
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="whitespace-nowrap">Pagamento</span>
            </TabsTrigger>
          </TabsList>

          {/* Detalhes Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 gap-4">
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
