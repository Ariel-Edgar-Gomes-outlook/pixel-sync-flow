import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Timer
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Job {
  id: string;
  title: string;
  type: string;
  status: string;
  start_datetime: string;
  end_datetime?: string;
  location?: string;
  description?: string;
  estimated_revenue?: number;
  estimated_cost?: number;
  estimated_hours?: number;
  time_spent?: number;
  tags?: string[];
  clients?: { name: string };
}

interface JobDetailsViewProps {
  job: Job;
}

export function JobDetailsView({ job }: JobDetailsViewProps) {
  const statusConfig = {
    scheduled: { label: "Agendado", variant: "secondary" as const },
    in_progress: { label: "Em Progresso", variant: "default" as const },
    completed: { label: "Concluído", variant: "outline" as const },
    cancelled: { label: "Cancelado", variant: "destructive" as const },
  };

  const statusInfo = statusConfig[job.status as keyof typeof statusConfig] || statusConfig.scheduled;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">{job.title}</h2>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="font-medium">{job.type}</span>
          {job.clients && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <span>{job.clients.name}</span>
            </>
          )}
        </div>
      </div>

      {/* Main Info Grid */}
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

      {/* Quick Links to Related Sections */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
          <Users className="h-5 w-5 text-primary mb-2" />
          <p className="text-sm font-medium">Equipe</p>
        </Card>
        <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
          <Image className="h-5 w-5 text-primary mb-2" />
          <p className="text-sm font-medium">Galeria</p>
        </Card>
        <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
          <Package className="h-5 w-5 text-primary mb-2" />
          <p className="text-sm font-medium">Equipamentos</p>
        </Card>
        <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
          <CheckSquare className="h-5 w-5 text-primary mb-2" />
          <p className="text-sm font-medium">Checklist</p>
        </Card>
      </div>
    </div>
  );
}
