import { useState, memo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateJob, useUpdateJob, Job } from "@/hooks/useJobs";
import { useClients } from "@/hooks/useClients";
import { ChecklistManager } from "@/components/ChecklistManager";
import { TeamManagement } from "@/components/TeamManagement";
import { toast } from "sonner";

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{job ? "Editar Job" : "Novo Job"}</DialogTitle>
        </DialogHeader>
        
        {job ? (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="col-span-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="client_id">Cliente</Label>
        <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecionar cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients?.map((client: any) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="type">Tipo *</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Casamento">Casamento</SelectItem>
            <SelectItem value="Corporativo">Corporativo</SelectItem>
            <SelectItem value="Evento">Evento</SelectItem>
            <SelectItem value="Sessão Fotográfica">Sessão Fotográfica</SelectItem>
            <SelectItem value="Produto">Produto</SelectItem>
            <SelectItem value="Outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="status">Estado *</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Job['status'] })} required>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Agendado</SelectItem>
            <SelectItem value="confirmed">Confirmado</SelectItem>
            <SelectItem value="in_production">Em Produção</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="location">Localização</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="start_datetime">Data/Hora Início *</Label>
        <Input
          id="start_datetime"
          type="datetime-local"
          value={formData.start_datetime}
          onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="end_datetime">Data/Hora Fim</Label>
        <Input
          id="end_datetime"
          type="datetime-local"
          value={formData.end_datetime}
          onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="estimated_hours">Horas Estimadas</Label>
        <Input
          id="estimated_hours"
          type="number"
          step="0.5"
          value={formData.estimated_hours}
          onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="estimated_cost">Custo Estimado (Kz)</Label>
        <Input
          id="estimated_cost"
          type="number"
          step="0.01"
          value={formData.estimated_cost}
          onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="estimated_revenue">Receita Estimada (Kz)</Label>
        <Input
          id="estimated_revenue"
          type="number"
          step="0.01"
          value={formData.estimated_revenue}
          onChange={(e) => setFormData({ ...formData, estimated_revenue: e.target.value })}
        />
      </div>

      <div className="col-span-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
    </div>

    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={() => setOpen(false)}>
        Cancelar
      </Button>
      <Button type="submit" disabled={createJob.isPending || updateJob.isPending}>
        {job ? "Atualizar" : "Criar"}
      </Button>
    </div>
  </>
));
