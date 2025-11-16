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
import { Loader2, Sparkles, Heart, Briefcase, Camera, Package, PartyPopper, ImageIcon, Check } from "lucide-react";
import { format } from "date-fns";

interface QuickStartWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JOB_TYPES = [
  { value: "wedding", label: "Casamento", icon: Heart },
  { value: "corporate", label: "Evento Corporativo", icon: Briefcase },
  { value: "portrait", label: "Retrato/Ensaio", icon: Camera },
  { value: "product", label: "Fotografia de Produto", icon: Package },
  { value: "event", label: "Evento Social", icon: PartyPopper },
  { value: "other", label: "Outro", icon: ImageIcon },
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

      toast.success("Trabalho criado com sucesso!", {
        description: "Galeria e checklist foram configurados automaticamente",
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar trabalho");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
            </div>
            Assistente de Criação Rápida
          </DialogTitle>
          <p className="text-xs sm:text-sm text-muted-foreground pt-1">
            Configure seu trabalho completo em 3 passos simples
          </p>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 sm:h-2 flex-1 rounded-full transition-all duration-300 ${
                  s < step ? "bg-primary" : s === step ? "bg-primary animate-pulse" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Job Type */}
          {step === 1 && (
            <div className="space-y-4 sm:space-y-5 animate-fade-in">
              <div className="space-y-1">
                <Label className="text-sm sm:text-base font-semibold">Tipo de Trabalho</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Selecione o tipo para configurar automaticamente templates e checklists
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {JOB_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = jobType === type.value;
                  return (
                    <Button
                      key={type.value}
                      variant={isSelected ? "default" : "outline"}
                      className={`h-auto py-3 sm:py-5 px-3 sm:px-4 flex items-center justify-start gap-3 sm:gap-4 transition-all duration-200 hover:scale-[1.02] ${
                        isSelected ? "ring-2 ring-primary shadow-lg" : ""
                      }`}
                      onClick={() => setJobType(type.value)}
                    >
                      <div className={`p-2 sm:p-3 rounded-lg ${isSelected ? "bg-primary-foreground/20" : "bg-primary/10"}`}>
                        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-left">{type.label}</span>
                    </Button>
                  );
                })}
              </div>
              <Button
                className="w-full h-10 sm:h-11 text-sm sm:text-base font-medium"
                disabled={!jobType}
                onClick={() => setStep(2)}
              >
                Continuar
              </Button>
            </div>
          )}

          {/* Step 2: Client & Date */}
          {step === 2 && (
            <div className="space-y-4 sm:space-y-5 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="client" className="text-sm sm:text-base font-semibold">Cliente *</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger className="h-10 sm:h-11">
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

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm sm:text-base font-semibold">Título do Trabalho (opcional)</Label>
                <Input
                  id="title"
                  placeholder="Ex: Casamento João & Maria"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="h-10 sm:h-11 text-sm sm:text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Deixe em branco para gerar automaticamente
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-semibold">Data do Trabalho *</Label>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-lg border bg-card shadow-sm scale-90 sm:scale-100"
                  />
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 h-10 sm:h-11 text-sm sm:text-base" 
                  onClick={() => setStep(1)}
                >
                  Voltar
                </Button>
                <Button
                  className="flex-1 h-10 sm:h-11 text-sm sm:text-base font-medium"
                  disabled={!clientId || !date}
                  onClick={() => setStep(3)}
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-4 sm:space-y-5 animate-fade-in">
              <div className="p-3 sm:p-5 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border space-y-3 sm:space-y-4">
                <h4 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Resumo do Trabalho
                </h4>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-background rounded-lg">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                      {JOB_TYPES.find(t => t.value === jobType)?.icon && 
                        (() => {
                          const Icon = JOB_TYPES.find(t => t.value === jobType)!.icon;
                          return <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />;
                        })()
                      }
                    </div>
                    <div className="space-y-0.5 sm:space-y-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Tipo</p>
                      <p className="font-medium truncate">{JOB_TYPES.find(t => t.value === jobType)?.label}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-background rounded-lg">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                      <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="space-y-0.5 sm:space-y-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Cliente</p>
                      <p className="font-medium truncate">{clients?.find(c => c.id === clientId)?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-background rounded-lg">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="space-y-0.5 sm:space-y-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Data</p>
                      <p className="font-medium">{date && format(date, "dd/MM/yyyy")}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0 mt-0.5" />
                  <h4 className="font-semibold text-xs sm:text-sm">Será criado automaticamente:</h4>
                </div>
                <ul className="text-xs sm:text-sm space-y-1.5 sm:space-y-2 ml-6 sm:ml-8">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                    <span>Trabalho completo com todas as informações</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                    <span>Galeria de cliente pré-configurada</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                    <span>Checklist baseada no tipo selecionado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                    <span>Status inicial: Agendado</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-2 sm:gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 h-10 sm:h-11 text-sm sm:text-base" 
                  onClick={() => setStep(2)}
                  disabled={loading}
                >
                  Voltar
                </Button>
                <Button
                  className="flex-1 h-10 sm:h-11 text-sm sm:text-base font-medium"
                  onClick={handleComplete}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Criar Trabalho
                    </>
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
