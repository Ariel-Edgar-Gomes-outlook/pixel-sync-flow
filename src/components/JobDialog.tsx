import { useState, memo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCreateJob, useUpdateJob, Job } from "@/hooks/useJobs";
import { useClients } from "@/hooks/useClients";
import { ChecklistManager } from "@/components/ChecklistManager";
import { TeamManagement } from "@/components/TeamManagement";
import { JobDeliverables } from "@/components/JobDeliverables";
import { JobResources } from "@/components/JobResources";
import { toast } from "sonner";
import { Briefcase, User, Calendar, MapPin, DollarSign, Clock, FileText, Tag } from "lucide-react";

interface JobDialogProps {
  children?: React.ReactNode;
  job?: Job;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialDate?: Date | null;
}

export function JobDialog({ children, job, open: controlledOpen, onOpenChange: controlledOnOpenChange, initialDate }: JobDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  
  const getInitialStartDate = () => {
    if (job?.start_datetime) return new Date(job.start_datetime).toISOString().slice(0, 16);
    if (initialDate) {
      const date = new Date(initialDate);
      date.setHours(10, 0, 0, 0);
      return date.toISOString().slice(0, 16);
    }
    return "";
  };
  
  const [formData, setFormData] = useState({
    title: job?.title || "",
    client_id: job?.client_id || "",
    type: job?.type || "",
    description: job?.description || "",
    start_datetime: getInitialStartDate(),
    end_datetime: job?.end_datetime ? new Date(job.end_datetime).toISOString().slice(0, 16) : "",
    location: job?.location || "",
    status: job?.status || "scheduled",
    estimated_hours: job?.estimated_hours?.toString() || "",
    estimated_cost: job?.estimated_cost?.toString() || "",
    estimated_revenue: job?.estimated_revenue?.toString() || "",
  });

  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const { data: clients } = useClients();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const jobData = {
      title: formData.title,
      client_id: formData.client_id || null,
      type: formData.type,
      description: formData.description || null,
      start_datetime: formData.start_datetime,
      end_datetime: formData.end_datetime || null,
      location: formData.location || null,
      status: formData.status as Job['status'],
      estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
      estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
      estimated_revenue: formData.estimated_revenue ? parseFloat(formData.estimated_revenue) : null,
    };

    try {
      if (job) {
        await updateJob.mutateAsync({ id: job.id, ...jobData });
        toast.success("Job atualizado!");
      } else {
        await createJob.mutateAsync(jobData);
        toast.success("Job criado!");
      }
      setOpen(false);
      setFormData({
        title: "",
        client_id: "",
        type: "",
        description: "",
        start_datetime: "",
        end_datetime: "",
        location: "",
        status: "scheduled",
        estimated_hours: "",
        estimated_cost: "",
        estimated_revenue: "",
      });
    } catch (error) {
      toast.error("Erro ao salvar job");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="w-[95vw] sm:w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            {job ? "Editar Job" : "Novo Job"}
          </DialogTitle>
          <DialogDescription>
            {job 
              ? "Atualize as informações do job de produção"
              : "Crie um novo job e organize todo o trabalho de produção"
            }
          </DialogDescription>
        </DialogHeader>
        
        {job ? (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="deliverables">Entregáveis</TabsTrigger>
              <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
              <TabsTrigger value="checklists">Checklists</TabsTrigger>
              <TabsTrigger value="team">Equipa</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <form onSubmit={handleSubmit} className="space-y-4">
                <JobForm 
                  formData={formData}
                  setFormData={setFormData}
                  clients={clients}
                  job={job}
                  setOpen={setOpen}
                  createJob={createJob}
                  updateJob={updateJob}
                />
              </form>
            </TabsContent>

            <TabsContent value="deliverables" className="space-y-4 py-4">
              <JobDeliverables 
                jobId={job.id}
                externalAssetsLinks={job.external_assets_links as string[] || []}
                externalGalleryLink={job.external_gallery_link}
              />
            </TabsContent>

            <TabsContent value="equipment" className="space-y-4 py-4">
              <JobResources
                jobId={job.id}
                startDatetime={job.start_datetime}
                endDatetime={job.end_datetime}
              />
            </TabsContent>

            <TabsContent value="checklists" className="space-y-4 py-4">
              <ChecklistManager jobId={job.id} />
            </TabsContent>

            <TabsContent value="team" className="space-y-4 py-4">
              <TeamManagement jobId={job.id} />
            </TabsContent>
          </Tabs>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <JobForm 
              formData={formData}
              setFormData={setFormData}
              clients={clients}
              job={job}
              setOpen={setOpen}
              createJob={createJob}
              updateJob={updateJob}
            />
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface JobFormProps {
  formData: any;
  setFormData: (data: any) => void;
  clients: any;
  job?: Job;
  setOpen: (open: boolean) => void;
  createJob: any;
  updateJob: any;
}

const JobForm = memo(({ formData, setFormData, clients, job, setOpen, createJob, updateJob }: JobFormProps) => (
  <>
    {/* Seção: Informações Básicas */}
    <Card className="p-3 sm:p-4 bg-muted/50">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Informações Básicas</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            Título do Job <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Ex: Casamento Maria & João"
            className="bg-background"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <p className="text-xs text-muted-foreground">Nome descritivo para identificar o trabalho</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_id" className="text-sm font-medium flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            Cliente
          </Label>
          <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Selecionar cliente" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {clients?.map((client: any) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Cliente associado ao job</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type" className="text-sm font-medium flex items-center gap-2">
            <Tag className="h-3.5 w-3.5" />
            Tipo de Job <span className="text-destructive">*</span>
          </Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })} required>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Selecionar tipo" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="Casamento">💒 Casamento</SelectItem>
              <SelectItem value="Corporativo">🏢 Corporativo</SelectItem>
              <SelectItem value="Evento">🎉 Evento</SelectItem>
              <SelectItem value="Sessão Fotográfica">📸 Sessão Fotográfica</SelectItem>
              <SelectItem value="Produto">📦 Produto</SelectItem>
              <SelectItem value="Outro">➕ Outro</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Categoria do trabalho</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium">Estado do Job <span className="text-destructive">*</span></Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Job['status'] })} required>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="scheduled">📅 Agendado</SelectItem>
              <SelectItem value="confirmed">✅ Confirmado</SelectItem>
              <SelectItem value="in_production">🎬 Em Produção</SelectItem>
              <SelectItem value="completed">🏆 Concluído</SelectItem>
              <SelectItem value="cancelled">❌ Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Estado atual do projeto</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" />
            Localização
          </Label>
          <Input
            id="location"
            placeholder="Ex: Hotel Five Stars, Luanda"
            className="bg-background"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Local onde ocorrerá o trabalho</p>
        </div>
      </div>
    </Card>

    <Separator />

    {/* Seção: Agendamento */}
    <Card className="p-3 sm:p-4 bg-muted/50">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Agendamento</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_datetime" className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            Data/Hora Início <span className="text-destructive">*</span>
          </Label>
          <Input
            id="start_datetime"
            type="datetime-local"
            className="bg-background"
            value={formData.start_datetime}
            onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
            required
          />
          <p className="text-xs text-muted-foreground">Quando o trabalho começa</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_datetime" className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            Data/Hora Fim
          </Label>
          <Input
            id="end_datetime"
            type="datetime-local"
            className="bg-background"
            value={formData.end_datetime}
            onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Quando o trabalho termina (opcional)</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimated_hours" className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            Horas Estimadas
          </Label>
          <Input
            id="estimated_hours"
            type="number"
            step="0.5"
            placeholder="0.0"
            className="bg-background"
            value={formData.estimated_hours}
            onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Tempo previsto de trabalho</p>
        </div>
      </div>
    </Card>

    <Separator />

    {/* Seção: Valores Financeiros */}
    <Card className="p-3 sm:p-4 bg-muted/50">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Valores Financeiros</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estimated_cost" className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5" />
            Custo Estimado (Kz)
          </Label>
          <Input
            id="estimated_cost"
            type="number"
            step="0.01"
            placeholder="0.00"
            className="bg-background"
            value={formData.estimated_cost}
            onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Custo total previsto do projeto</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimated_revenue" className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5" />
            Receita Estimada (Kz)
          </Label>
          <Input
            id="estimated_revenue"
            type="number"
            step="0.01"
            placeholder="0.00"
            className="bg-background"
            value={formData.estimated_revenue}
            onChange={(e) => setFormData({ ...formData, estimated_revenue: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Valor que será cobrado ao cliente</p>
        </div>
      </div>

      {formData.estimated_cost && formData.estimated_revenue && (
        <div className="mt-4 p-3 bg-primary/10 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">Margem de Lucro:</span>
            <span className={`text-lg font-bold ${
              Number(formData.estimated_revenue) - Number(formData.estimated_cost) > 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {(Number(formData.estimated_revenue) - Number(formData.estimated_cost)).toFixed(2)} Kz
            </span>
          </div>
        </div>
      )}
    </Card>

    <Separator />

    {/* Seção: Descrição */}
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Descrição e Notas</h3>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Descrição do Job
        </Label>
        <Textarea
          id="description"
          placeholder="Adicione detalhes importantes sobre o trabalho, requisitos especiais, observações..."
          className="bg-background"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Informações adicionais, requisitos do cliente ou observações importantes
        </p>
      </div>
    </div>

    <Separator />

    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
      <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
        Cancelar
      </Button>
      <Button type="submit" disabled={createJob.isPending || updateJob.isPending} className="w-full sm:w-auto">
        {createJob.isPending || updateJob.isPending
          ? "Guardando..."
          : job ? "Atualizar Job" : "Criar Job"}
      </Button>
    </div>
  </>
));
