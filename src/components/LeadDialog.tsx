import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateLead, useUpdateLead, Lead } from "@/hooks/useLeads";
import { useClients } from "@/hooks/useClients";
import { toast } from "sonner";

interface LeadDialogProps {
  children?: React.ReactNode;
  lead?: Lead;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LeadDialog({ children, lead, open: controlledOpen, onOpenChange: controlledOnOpenChange }: LeadDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const [formData, setFormData] = useState({
    client_id: lead?.client_id || "",
    source: lead?.source || "",
    status: lead?.status || "new",
    probability: lead?.probability?.toString() || "50",
    notes: lead?.notes || "",
  });

  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const { data: clients } = useClients();

  useEffect(() => {
    if (lead) {
      setFormData({
        client_id: lead.client_id || "",
        source: lead.source || "",
        status: lead.status || "new",
        probability: lead.probability?.toString() || "50",
        notes: lead.notes || "",
      });
    }
  }, [lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const leadData = {
      client_id: formData.client_id || null,
      source: formData.source || null,
      status: formData.status as Lead['status'],
      probability: parseInt(formData.probability),
      notes: formData.notes || null,
    };

    try {
      if (lead) {
        await updateLead.mutateAsync({ id: lead.id, ...leadData });
        toast.success("Lead atualizado com sucesso!");
      } else {
        await createLead.mutateAsync(leadData);
        toast.success("Lead criado com sucesso!");
      }
      setOpen(false);
      setFormData({
        client_id: "",
        source: "",
        status: "new",
        probability: "50",
        notes: "",
      });
    } catch (error) {
      toast.error("Erro ao salvar lead");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {lead ? "Editar Lead" : "Novo Lead"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
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

            <div className="grid gap-2">
              <Label htmlFor="source">Fonte</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="Ex: Instagram, Referência, Website..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Lead['status'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Novo</SelectItem>
                    <SelectItem value="contacted">Contactado</SelectItem>
                    <SelectItem value="proposal_sent">Proposta Enviada</SelectItem>
                    <SelectItem value="won">Ganho</SelectItem>
                    <SelectItem value="lost">Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="probability">Probabilidade (%)</Label>
                <Input
                  id="probability"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Informações sobre o lead..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" disabled={createLead.isPending || updateLead.isPending} className="w-full sm:w-auto">
              {lead ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}