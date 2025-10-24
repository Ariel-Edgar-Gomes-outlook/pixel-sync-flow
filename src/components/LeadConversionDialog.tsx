import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { UserCheck, FileText, Briefcase, ArrowRight } from "lucide-react";
import { useCreateClient } from "@/hooks/useClients";
import { useUpdateLead } from "@/hooks/useLeads";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Lead {
  id: string;
  clients?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  notes?: string;
}

interface LeadConversionDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadConversionDialog({ lead, open, onOpenChange }: LeadConversionDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [nextAction, setNextAction] = useState<'none' | 'quote' | 'job'>('none');
  const [clientData, setClientData] = useState({
    name: lead?.clients?.name || "",
    email: lead?.clients?.email || "",
    phone: lead?.clients?.phone || "",
    notes: lead?.notes || "",
  });

  const createClient = useCreateClient();
  const updateLead = useUpdateLead();
  const navigate = useNavigate();

  const handleConvert = async () => {
    if (!lead) return;

    try {
      // Create client
      const newClient = await createClient.mutateAsync({
        name: clientData.name,
        email: clientData.email || null,
        phone: clientData.phone || null,
        notes: clientData.notes || null,
        type: 'person',
      });

      // Update lead status
      await updateLead.mutateAsync({
        id: lead.id,
        status: 'won',
        client_id: newClient.id,
      });

      toast.success("Lead convertido em cliente!");

      // Navigate based on next action
      if (nextAction === 'quote') {
        navigate('/quotes', { state: { clientId: newClient.id } });
      } else if (nextAction === 'job') {
        navigate('/jobs', { state: { clientId: newClient.id } });
      } else {
        navigate('/clients');
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao converter lead:", error);
      toast.error("Erro ao converter lead");
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <UserCheck className="h-6 w-6 text-primary" />
            Converter Lead em Cliente
          </DialogTitle>
          <DialogDescription>
            Transforme este lead num cliente e escolha o próximo passo
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Confirmar Dados do Cliente</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={clientData.name}
                onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                placeholder="Nome completo"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={clientData.email}
                  onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={clientData.phone}
                  onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                  placeholder="+244 xxx xxx xxx"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={clientData.notes}
                onChange={(e) => setClientData({ ...clientData, notes: e.target.value })}
                placeholder="Informações adicionais sobre o cliente"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setStep(2)} disabled={!clientData.name}>
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Escolha o Próximo Passo</h3>
            
            <RadioGroup value={nextAction} onValueChange={(value: any) => setNextAction(value)}>
              <Card className="p-4 cursor-pointer hover:border-primary transition-colors">
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="none" id="none" />
                  <div className="flex-1">
                    <Label htmlFor="none" className="cursor-pointer font-medium">
                      Apenas criar cliente
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Criar o cliente sem ações adicionais
                    </p>
                  </div>
                  <UserCheck className="h-5 w-5 text-muted-foreground" />
                </div>
              </Card>

              <Card className="p-4 cursor-pointer hover:border-primary transition-colors">
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="quote" id="quote" />
                  <div className="flex-1">
                    <Label htmlFor="quote" className="cursor-pointer font-medium">
                      Criar cliente + Orçamento
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Abrir dialog para criar orçamento para este cliente
                    </p>
                  </div>
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
              </Card>

              <Card className="p-4 cursor-pointer hover:border-primary transition-colors">
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="job" id="job" />
                  <div className="flex-1">
                    <Label htmlFor="job" className="cursor-pointer font-medium">
                      Criar cliente + Job
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Abrir dialog para criar job para este cliente
                    </p>
                  </div>
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                </div>
              </Card>
            </RadioGroup>

            <div className="flex justify-between gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button onClick={handleConvert}>
                Converter Lead
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
