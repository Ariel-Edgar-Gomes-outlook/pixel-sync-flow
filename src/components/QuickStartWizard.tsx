import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useCreateJob } from "@/hooks/useJobs";
import { useClients } from "@/hooks/useClients";
import { useCreateGallery } from "@/hooks/useGalleries";
import { useCreateChecklist } from "@/hooks/useChecklists";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { format } from "date-fns";

interface QuickStartWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JOB_TYPES = [
  { value: "wedding", label: "Casamento", icon: "💍" },
  { value: "corporate", label: "Evento Corporativo", icon: "🏢" },
  { value: "portrait", label: "Retrato/Ensaio", icon: "📸" },
  { value: "product", label: "Fotografia de Produto", icon: "📦" },
  { value: "event", label: "Evento Social", icon: "🎉" },
  { value: "other", label: "Outro", icon: "📷" },
];

export function QuickStartWizard({ open, onOpenChange }: QuickStartWizardProps) {
  const [step, setStep] = useState(1);
  const [jobType, setJobType] = useState("");
  const [clientId, setClientId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [date, setDate] = useState<Date>();
  const [loading, setLoading] = useState(false);

  const { data: clients } = useClients();
  const { data: checklists } = useQuery({
    queryKey: ['checklist_templates'],
    queryFn: async () => {
      const { data } = await supabase.from('checklist_templates').select('*');
      return data;
    }
  });
  const createJob = useCreateJob();
  const createGallery = useCreateGallery();
  const createChecklist = useCreateChecklist();

  const resetForm = () => {
    setStep(1);
    setJobType("");
    setClientId("");
    setJobTitle("");
    setDate(undefined);
  };

  const handleComplete = async () => {
    if (!jobType || !clientId || !date) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      // 1. Criar Job
      const jobData = {
        title: jobTitle || `${JOB_TYPES.find(t => t.value === jobType)?.label} - ${clients?.find(c => c.id === clientId)?.name}`,
        type: jobType,
        client_id: clientId,
        start_datetime: date.toISOString(),
        status: "scheduled" as const,
      };

      const newJob = await createJob.mutateAsync(jobData);

      // 2. Criar Galeria automaticamente
      await createGallery.mutateAsync({
        job_id: newJob.id,
        name: `Galeria - ${jobData.title}`,
        status: "active",
        allow_selection: true,
        password_protected: false,
        gallery_links: [],
      });

      // 3. Criar Checklist baseada em template (se houver)
      const template = checklists?.find(t => t.job_type === jobType);
      if (template) {
        await createChecklist.mutateAsync({
          job_id: newJob.id,
          type: jobType,
          items: template.items as any,
          estimated_time: template.estimated_time,
        });
      }

      toast.success("Job criado com sucesso!", {
        description: "Galeria e checklist foram configurados automaticamente",
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Quick Start - Criar Job Completo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Job Type */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Tipo de Trabalho</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Selecione o tipo para configurar automaticamente templates e checklists
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {JOB_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    variant={jobType === type.value ? "default" : "outline"}
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => setJobType(type.value)}
                  >
                    <span className="text-3xl">{type.icon}</span>
                    <span className="text-sm">{type.label}</span>
                  </Button>
                ))}
              </div>
              <Button
                className="w-full"
                disabled={!jobType}
                onClick={() => setStep(2)}
              >
                Próximo
              </Button>
            </div>
          )}

          {/* Step 2: Client & Date */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="client">Cliente *</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
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
                <Label htmlFor="title">Título do Job (opcional)</Label>
                <Input
                  id="title"
                  placeholder="Ex: Casamento João & Maria"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Deixe em branco para gerar automaticamente
                </p>
              </div>

              <div>
                <Label>Data do Job *</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Voltar
                </Button>
                <Button
                  className="flex-1"
                  disabled={!clientId || !date}
                  onClick={() => setStep(3)}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <h4 className="font-semibold">Resumo</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Tipo:</span>{" "}
                    <span className="font-medium">
                      {JOB_TYPES.find(t => t.value === jobType)?.label}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Cliente:</span>{" "}
                    <span className="font-medium">
                      {clients?.find(c => c.id === clientId)?.name}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Data:</span>{" "}
                    <span className="font-medium">
                      {date && format(date, "dd/MM/yyyy")}
                    </span>
                  </p>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg">
                <h4 className="font-semibold mb-2 text-sm">✨ Será criado automaticamente:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>✓ Job completo com informações do cliente</li>
                  <li>✓ Galeria de cliente configurada</li>
                  <li>✓ Checklist baseada no tipo de trabalho</li>
                  <li>✓ Status inicial: Agendado</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  Voltar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleComplete}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Job Completo"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
