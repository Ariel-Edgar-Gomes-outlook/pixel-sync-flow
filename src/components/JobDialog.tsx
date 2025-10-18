import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateJob, useUpdateJob, Job } from "@/hooks/useJobs";
import { useClients } from "@/hooks/useClients";
import { toast } from "sonner";

interface JobDialogProps {
  children: React.ReactNode;
  job?: Job;
}

export function JobDialog({ children, job }: JobDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: job?.title || "",
    client_id: job?.client_id || "",
    type: job?.type || "",
    description: job?.description || "",
    start_datetime: job?.start_datetime ? new Date(job.start_datetime).toISOString().slice(0, 16) : "",
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
        toast.success("Job atualizado com sucesso!");
      } else {
        await createJob.mutateAsync(jobData);
        toast.success("Job criado com sucesso!");
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
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{job ? "Editar Job" : "Novo Job"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
                  {clients?.map((client) => (
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
                  <SelectItem value="delivery_pending">Entrega Pendente</SelectItem>
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
              <Label htmlFor="estimated_cost">Custo Estimado (€)</Label>
              <Input
                id="estimated_cost"
                type="number"
                step="0.01"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="estimated_revenue">Receita Estimada (€)</Label>
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
