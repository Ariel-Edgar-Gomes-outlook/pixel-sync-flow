import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCreateLead, useUpdateLead, Lead } from "@/hooks/useLeads";
import { useClients } from "@/hooks/useClients";
import { toast } from "sonner";
import { TrendingUp, User, Target, FileText, Lightbulb } from "lucide-react";

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
      <DialogContent className="w-[95vw] sm:w-full max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            {lead ? "Editar Lead" : "Novo Lead"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cliente */}
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <User className="h-5 w-5 text-primary" />
              <Label htmlFor="client_id" className="text-base font-semibold">
                Cliente / Empresa
              </Label>
            </div>
            <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
              <SelectTrigger className="h-12 bg-background">
                <SelectValue placeholder="Selecione o cliente potencial" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Quem é este lead? Pode criar um novo cliente se necessário
            </p>
          </Card>

          <Separator />

          {/* Origem e Fonte */}
          <Card className="p-3 sm:p-4 bg-muted/50">
            <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Origem do Lead
            </h3>
            <div className="space-y-2">
              <Label htmlFor="source" className="text-sm font-medium">Como conheceu?</Label>
              <Input
                id="source"
                className="bg-background"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="Ex: Instagram, Facebook, Indicação, Website, WhatsApp..."
              />
              <p className="text-xs text-muted-foreground">
                De onde veio este contacto? Rastreie suas fontes de leads
              </p>
            </div>
          </Card>

          {/* Estado e Probabilidade */}
          <Card className="p-3 sm:p-4 bg-muted/50">
            <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Estado do Lead
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">Etapa Atual</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Lead['status'] })}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="new">🆕 Novo (Primeiro Contacto)</SelectItem>
                    <SelectItem value="contacted">📞 Contactado (Em conversa)</SelectItem>
                    <SelectItem value="proposal_sent">📄 Proposta Enviada</SelectItem>
                    <SelectItem value="won">✅ Ganho (Fechado!)</SelectItem>
                    <SelectItem value="lost">❌ Perdido (Não converteu)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Em que fase está o lead?</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="probability" className="text-sm font-medium">Probabilidade de Fechar</Label>
                <div className="relative">
                  <Input
                    id="probability"
                    type="number"
                    min="0"
                    max="100"
                    className="bg-background pr-12"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    %
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Qual a chance de converter? (0-100%)
                </p>
              </div>
            </div>
          </Card>

          {/* Notas */}
          <Card className="p-3 sm:p-4 bg-muted/50">
            <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Observações
            </h3>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Notas sobre o Lead</Label>
              <Textarea
                id="notes"
                className="bg-background min-h-24"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Detalhes importantes: necessidades do cliente, orçamento mencionado, próximos passos..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Registre informações importantes sobre este lead
              </p>
            </div>
          </Card>

          {/* Resumo Visual */}
          {formData.client_id && (
            <Card className="p-3 sm:p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resumo do Lead</p>
                  <p className="text-sm font-medium mt-1">
                    {clients?.find(c => c.id === formData.client_id)?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Probabilidade</p>
                  <p className="text-xl sm:text-2xl font-bold text-primary">
                    {formData.probability}%
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createLead.isPending || updateLead.isPending}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createLead.isPending || updateLead.isPending}
              className="w-full sm:w-auto sm:min-w-32"
            >
              {createLead.isPending || updateLead.isPending ? "A guardar..." : lead ? "Atualizar Lead" : "Criar Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}