import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useCreateContract, useUpdateContract, useDeleteContract } from "@/hooks/useContracts";
import { useClients } from "@/hooks/useClients";
import { useJobs } from "@/hooks/useJobs";
import { useContractTemplates, useCreateContractTemplate } from "@/hooks/useTemplates";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Sparkles, Send, Copy, FileSignature, FileDown, Save, Trash2 } from "lucide-react";
import { z } from "zod";
import { useCurrency } from "@/hooks/useCurrency";

const contractSchema = z.object({
  client_id: z.string().min(1, "Cliente é obrigatório"),
  job_id: z.string().nullable(),
  status: z.enum(['draft', 'sent', 'pending_signature', 'signed', 'active', 'cancelled']),
  terms_text: z.string().min(50, "Termos devem ter pelo menos 50 caracteres").max(10000, "Termos não podem exceder 10000 caracteres"),
  usage_rights_text: z.string().max(5000, "Texto muito longo").optional(),
  cancellation_policy_text: z.string().max(5000, "Texto muito longo").optional(),
  late_delivery_clause: z.string().max(2000, "Texto muito longo").optional(),
  copyright_notice: z.string().max(2000, "Texto muito longo").optional(),
  reschedule_policy: z.string().max(2000, "Texto muito longo").optional(),
  revision_policy: z.string().max(2000, "Texto muito longo").optional(),
  cancellation_fee: z.number().min(0).max(1000000),
}).refine(
  (data) => {
    if (data.cancellation_fee > 0 && (!data.cancellation_policy_text || data.cancellation_policy_text.length < 20)) {
      return false;
    }
    return true;
  },
  {
    message: "Política de cancelamento é obrigatória quando há taxa de cancelamento",
    path: ["cancellation_policy_text"],
  }
);

interface Contract {
  id: string;
  client_id: string;
  job_id?: string | null;
  status: 'draft' | 'sent' | 'pending_signature' | 'signed' | 'active' | 'cancelled';
  terms_text?: string;
  usage_rights_text?: string;
  cancellation_policy_text?: string;
  late_delivery_clause?: string;
  copyright_notice?: string;
  reschedule_policy?: string;
  revision_policy?: string;
  signature_token?: string;
  signature_url?: string;
  issued_at?: string;
  signed_at?: string | null;
  cancellation_fee?: number;
  clients?: { id: string; name: string; email: string };
  jobs?: { id: string; title: string };
}

interface ContractDialogProps {
  children?: React.ReactNode;
  contract?: Contract;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ContractDialog({ children, contract, open, onOpenChange }: ContractDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { currencyInfo } = useCurrency();
  const [formData, setFormData] = useState({
    client_id: "",
    job_id: null as string | null,
    status: "draft" as Contract['status'],
    terms_text: "",
    usage_rights_text: "",
    cancellation_policy_text: "",
    late_delivery_clause: "",
    copyright_notice: "",
    reschedule_policy: "",
    revision_policy: "",
    cancellation_fee: 0,
  });

  const createContract = useCreateContract();
  const updateContract = useUpdateContract();
  const deleteContract = useDeleteContract();
  const createTemplate = useCreateContractTemplate();
  const { data: clients } = useClients();
  const { data: jobs } = useJobs();
  const { data: contractTemplates } = useContractTemplates();

  const actualOpen = open !== undefined ? open : isOpen;
  const actualOnOpenChange = onOpenChange || setIsOpen;

  useEffect(() => {
    if (contract) {
      setFormData({
        client_id: contract.client_id,
        job_id: contract.job_id || null,
        status: contract.status,
        terms_text: contract.terms_text || "",
        usage_rights_text: contract.usage_rights_text || "",
        cancellation_policy_text: contract.cancellation_policy_text || "",
        late_delivery_clause: contract.late_delivery_clause || "",
        copyright_notice: contract.copyright_notice || "",
        reschedule_policy: contract.reschedule_policy || "",
        revision_policy: contract.revision_policy || "",
        cancellation_fee: Number(contract.cancellation_fee) || 0,
      });
    }
  }, [contract]);

  const handleUseTemplate = (templateId: string) => {
    const template = contractTemplates?.find(t => t.id === templateId);
    if (!template) return;

    const clauses = template.clauses as any || {};
    
    setFormData(prev => ({
      ...prev,
      terms_text: template.terms_text,
      cancellation_fee: Number(template.cancellation_fee) || 0,
      usage_rights_text: clauses.usage_rights_text || "",
      cancellation_policy_text: clauses.cancellation_policy_text || "",
      late_delivery_clause: clauses.late_delivery_clause || "",
      copyright_notice: clauses.copyright_notice || "",
      reschedule_policy: clauses.reschedule_policy || "",
      revision_policy: clauses.revision_policy || "",
    }));
    toast.success("Template aplicado!");
  };

  const applyPhotographyTemplate = (type: 'wedding' | 'event' | 'portrait') => {
    const templates = {
      wedding: {
        terms_text: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS - CASAMENTO

CONTRATANTE: [Nome do Cliente]
CONTRATADO: [Nome do Fotógrafo]

1. OBJETO DO CONTRATO
O presente contrato tem por objeto a prestação de serviços de fotografia profissional para o evento de casamento.

2. DO SERVIÇO
2.1. Cobertura fotográfica do evento de casamento
2.2. Fotografias em alta resolução editadas
2.3. Entrega digital via galeria online protegida
2.4. Prazo de entrega: até 60 dias após o evento

3. DO VALOR E PAGAMENTO
Valor total: [Valor acordado]
Forma de pagamento: [Conforme plano acordado]`,
        
        usage_rights_text: "O CONTRATANTE terá direito de uso pessoal e não comercial das imagens. É permitido publicar nas redes sociais com os devidos créditos ao fotógrafo. Uso comercial requer autorização prévia por escrito.",
        
        cancellation_policy_text: "Em caso de cancelamento pelo CONTRATANTE com mais de 90 dias de antecedência: reembolso de 80%. Entre 90 e 30 dias: reembolso de 50%. Menos de 30 dias: sem reembolso. O sinal pago não é reembolsável.",
        
        copyright_notice: "Todos os direitos autorais das fotografias pertencem ao CONTRATADO. O CONTRATANTE recebe direito de uso conforme especificado nas cláusulas de direitos de uso.",
        
        reschedule_policy: "A remarcação do evento é permitida uma vez sem custos adicionais, desde que comunicada com no mínimo 30 dias de antecedência e sujeita à disponibilidade do profissional.",
        
        revision_policy: "Estão incluídas até 3 rodadas de revisões na edição das fotos. Revisões adicionais serão cobradas separadamente.",
      },
      event: {
        terms_text: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS - EVENTO

CONTRATANTE: [Nome do Cliente]
CONTRATADO: [Nome do Fotógrafo]

1. OBJETO DO CONTRATO
Prestação de serviços de fotografia profissional para evento corporativo/social.

2. DO SERVIÇO
2.1. Cobertura fotográfica durante [X] horas
2.2. Fotografias em alta resolução editadas
2.3. Entrega digital via galeria protegida
2.4. Prazo de entrega: até 30 dias

3. DO VALOR
Valor total: [Valor acordado]`,
        
        usage_rights_text: "O CONTRATANTE terá direito de uso comercial limitado das imagens. Publicação em materiais de marketing e redes sociais permitida com créditos ao fotógrafo.",
        
        cancellation_policy_text: "Cancelamento com mais de 15 dias: reembolso de 70%. Entre 15 e 7 dias: reembolso de 40%. Menos de 7 dias: sem reembolso.",
        
        copyright_notice: "Direitos autorais pertencem ao CONTRATADO. Uso comercial extensivo requer licença adicional.",
        
        reschedule_policy: "Uma remarcação sem custo adicional permitida com aviso de 15 dias.",
        
        revision_policy: "Incluídas 2 rodadas de revisões.",
      },
      portrait: {
        terms_text: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS - ENSAIO

CONTRATANTE: [Nome do Cliente]
CONTRATADO: [Nome do Fotógrafo]

1. OBJETO DO CONTRATO
Sessão de fotos individuais/familiares.

2. DO SERVIÇO
2.1. Sessão fotográfica de [X] hora(s)
2.2. Mínimo de [X] fotos editadas
2.3. Entrega digital
2.4. Prazo de entrega: até 15 dias

3. DO VALOR
Valor total: [Valor acordado]`,
        
        usage_rights_text: "Uso pessoal ilimitado. Publicação em redes sociais permitida com créditos. Uso comercial não autorizado sem licença específica.",
        
        cancellation_policy_text: "Cancelamento com mais de 7 dias: reembolso de 80%. Entre 7 e 3 dias: reembolso de 50%. Menos de 3 dias: sem reembolso.",
        
        copyright_notice: "Direitos autorais do fotógrafo. Cliente recebe licença de uso pessoal.",
        
        reschedule_policy: "Uma remarcação gratuita com aviso de 48 horas.",
        
        revision_policy: "Incluída 1 rodada de revisões.",
      },
    };

    const template = templates[type];
    setFormData(prev => ({
      ...prev,
      ...template,
    }));
    
    toast.success(`Template de ${type === 'wedding' ? 'Casamento' : type === 'event' ? 'Evento' : 'Ensaio'} aplicado!`);
  };

  const handleGeneratePDF = () => {
    if (!contract) return;
    
    // Dispatch event to open PDFViewerDialog with local generation
    const event = new CustomEvent('openPDFViewer', { 
      detail: { 
        pdfSource: {
          type: 'local',
          entityType: 'contract',
          entityId: contract.id
        },
        title: `Contrato - ${clients?.find(c => c.id === contract.client_id)?.name || 'Cliente'}` 
      } 
    });
    window.dispatchEvent(event);
  };

  const sendContractForSignature = async (contractId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('send-contract-email', {
        body: {
          contractId,
          type: 'signature_request',
        },
      });

      if (response.error) throw response.error;

      toast.success("Email de assinatura enviado!", {
        description: response.data.emailSent 
          ? "Cliente receberá o link por email" 
          : "Copie o link de assinatura e envie manualmente"
      });

      return response.data.signatureUrl;
    } catch (error: any) {
      console.error('Failed to send contract:', error);
      toast.error("Erro ao enviar contrato", {
        description: error.message
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar se contrato assinado não pode ser editado
    if (contract && (contract.status === 'signed' || contract.status === 'active')) {
      toast.error("Não é possível editar contratos assinados ou ativos");
      return;
    }

    // Confirmar edição de contrato enviado
    if (contract && contract.status === 'sent') {
      const confirmed = window.confirm(
        "Este contrato já foi enviado para assinatura. Ao editar, pode ser necessário reenviar. Deseja continuar?"
      );
      if (!confirmed) return;
    }
    
    try {
      setIsGeneratingPDF(true);
      const validatedData = contractSchema.parse(formData);
      
      // Gerar signature_token se novo contrato
      const dataToSave = {
        ...validatedData,
        issued_at: contract?.issued_at || new Date().toISOString(),
      };

      let savedContract;
      if (contract) {
        savedContract = await updateContract.mutateAsync({ id: contract.id, ...dataToSave });
        toast.success("Contrato atualizado!");
      } else {
        savedContract = await createContract.mutateAsync(dataToSave);
        toast.success("Contrato criado!");
      }

      // Success - contract saved
      if (savedContract) {
        toast.success("Contrato salvo! Use o botão 'Ver PDF' para visualizar.", {
        });

        // Se status for 'sent', enviar email automaticamente
        if (formData.status === 'sent') {
          await sendContractForSignature(savedContract.id);
        }
      }

      actualOnOpenChange(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach(err => toast.error(err.message));
      } else {
        console.error("Erro ao salvar contrato:", error);
        toast.error("Erro ao salvar contrato");
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const copySignatureLink = () => {
    if (contract?.signature_token) {
      const link = `${window.location.origin}/contract/sign/${contract.signature_token}`;
      navigator.clipboard.writeText(link);
      toast.success("Link de assinatura copiado!");
    }
  };

  const handleSaveAsTemplate = async () => {
    const templateName = prompt("Nome para o template:", "Novo Template de Contrato");
    if (!templateName) return;

    try {
      await createTemplate.mutateAsync({
        name: templateName,
        terms_text: formData.terms_text,
        cancellation_fee: formData.cancellation_fee,
        clauses: {
          usage_rights_text: formData.usage_rights_text,
          cancellation_policy_text: formData.cancellation_policy_text,
          late_delivery_clause: formData.late_delivery_clause,
          copyright_notice: formData.copyright_notice,
          reschedule_policy: formData.reschedule_policy,
          revision_policy: formData.revision_policy,
        },
      });
      toast.success("Template salvo! Você pode reutilizá-lo em novos contratos.");
    } catch (error) {
      toast.error("Erro ao salvar template");
    }
  };

  return (
    <Dialog open={actualOpen} onOpenChange={actualOnOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="w-[95vw] sm:w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="text-base sm:text-lg">{contract ? "Editar Contrato" : "Novo Contrato Profissional"}</span>
            </DialogTitle>
            <div className="flex flex-wrap gap-2">
              {contract && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePDF}
                  disabled={isGeneratingPDF}
                  className="text-xs sm:text-sm"
                >
                  <FileDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  {isGeneratingPDF ? "Gerando..." : "Gerar PDF"}
                </Button>
              )}
              {contract?.signature_token && (
                <Button variant="outline" size="sm" onClick={copySignatureLink} className="text-xs sm:text-sm">
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Link Assinatura
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basics" className="w-full">
            <div className="overflow-x-auto pb-2">
              <TabsList className="grid w-full grid-cols-4 min-w-max sm:min-w-0">
                <TabsTrigger value="basics" className="whitespace-nowrap">Básico</TabsTrigger>
                <TabsTrigger value="terms" className="whitespace-nowrap">Termos</TabsTrigger>
                <TabsTrigger value="policies" className="whitespace-nowrap">Políticas</TabsTrigger>
                <TabsTrigger value="rights" className="whitespace-nowrap">Direitos</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="basics" className="space-y-4 mt-4">
              <Card className="p-4 bg-muted/50">
                <div className="mb-4 space-y-3">
                  {contractTemplates && contractTemplates.length > 0 && (
                    <div>
                      <Label>Templates Salvos</Label>
                      <Select onValueChange={handleUseTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolher template salvo..." />
                        </SelectTrigger>
                        <SelectContent>
                          {contractTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">Templates Rápidos</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applyPhotographyTemplate('wedding')}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Template </span>Casamento
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applyPhotographyTemplate('event')}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Template </span>Evento
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applyPhotographyTemplate('portrait')}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Template </span>Ensaio
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Cliente *</Label>
                    <Select
                      value={formData.client_id}
                      onValueChange={(value) => setFormData({ ...formData, client_id: value, job_id: null })}
                    >
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
                    <Label>Job Associado</Label>
                    <Select
                      value={formData.job_id || "none"}
                      onValueChange={(value) => 
                        setFormData({ ...formData, job_id: value === "none" ? null : value })
                      }
                      disabled={!formData.client_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={!formData.client_id ? "Selecione um cliente primeiro" : "Opcional"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {jobs?.filter(job => job.client_id === formData.client_id).map((job) => (
                          <SelectItem key={job.id} value={job.id}>
                            {job.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => 
                        setFormData({ ...formData, status: value as Contract['status'] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">📝 Rascunho</SelectItem>
                        <SelectItem value="sent">📤 Enviado</SelectItem>
                        <SelectItem value="pending_signature">✍️ Aguardando Assinatura</SelectItem>
                        <SelectItem value="signed">✅ Assinado</SelectItem>
                        <SelectItem value="active">🟢 Ativo</SelectItem>
                        <SelectItem value="cancelled">❌ Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Taxa de Cancelamento ({currencyInfo.symbol})</Label>
                    <Input
                      type="number"
                      value={formData.cancellation_fee || ''}
                      onChange={(e) => 
                        setFormData({ ...formData, cancellation_fee: e.target.value ? parseFloat(e.target.value) : 0 })
                      }
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="terms" className="space-y-4 mt-4">
              <Card className="p-4">
                <Label>Termos e Condições Principais</Label>
                <Textarea
                  value={formData.terms_text}
                  onChange={(e) => setFormData({ ...formData, terms_text: e.target.value })}
                  placeholder="Digite os termos principais do contrato..."
                  rows={15}
                  className="mt-2"
                  maxLength={10000}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {formData.terms_text.length} / 10000 caracteres
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="policies" className="space-y-4 mt-4">
              <Card className="p-4 space-y-4">
                <div>
                  <Label>Política de Cancelamento</Label>
                  <Textarea
                    value={formData.cancellation_policy_text}
                    onChange={(e) => 
                      setFormData({ ...formData, cancellation_policy_text: e.target.value })
                    }
                    placeholder="Ex: Cancelamento com mais de 30 dias: reembolso de 80%..."
                    rows={4}
                    maxLength={5000}
                  />
                </div>

                <div>
                  <Label>Política de Remarcação</Label>
                  <Textarea
                    value={formData.reschedule_policy}
                    onChange={(e) => 
                      setFormData({ ...formData, reschedule_policy: e.target.value })
                    }
                    placeholder="Ex: Permitida uma remarcação gratuita com 15 dias de antecedência..."
                    rows={4}
                    maxLength={2000}
                  />
                </div>

                <div>
                  <Label>Cláusula de Entrega Tardia</Label>
                  <Textarea
                    value={formData.late_delivery_clause}
                    onChange={(e) => 
                      setFormData({ ...formData, late_delivery_clause: e.target.value })
                    }
                    placeholder="Ex: Em caso de atraso justificado, será aplicado desconto proporcional..."
                    rows={4}
                    maxLength={2000}
                  />
                </div>

                <div>
                  <Label>Política de Revisões</Label>
                  <Textarea
                    value={formData.revision_policy}
                    onChange={(e) => 
                      setFormData({ ...formData, revision_policy: e.target.value })
                    }
                    placeholder="Ex: Incluídas até 3 rodadas de revisões na edição..."
                    rows={4}
                    maxLength={2000}
                  />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="rights" className="space-y-4 mt-4">
              <Card className="p-4 space-y-4">
                <div>
                  <Label>Direitos de Uso de Imagem</Label>
                  <Textarea
                    value={formData.usage_rights_text}
                    onChange={(e) => 
                      setFormData({ ...formData, usage_rights_text: e.target.value })
                    }
                    placeholder="Ex: O cliente terá direito de uso pessoal e não comercial das imagens..."
                    rows={6}
                    maxLength={5000}
                  />
                </div>

                <div>
                  <Label>Aviso de Direitos Autorais</Label>
                  <Textarea
                    value={formData.copyright_notice}
                    onChange={(e) => 
                      setFormData({ ...formData, copyright_notice: e.target.value })
                    }
                    placeholder="Ex: Todos os direitos autorais pertencem ao fotógrafo..."
                    rows={4}
                    maxLength={2000}
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-between mt-6">
            <div className="flex flex-col sm:flex-row gap-2 order-2 sm:order-1">
              {contract && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deleteContract.isPending}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSaveAsTemplate}
                disabled={!formData.terms_text || formData.terms_text.length < 50}
                title="Salvar este contrato como template reutilizável"
                className="w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Salvar como </span>Template
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => actualOnOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createContract.isPending || updateContract.isPending || isGeneratingPDF}
                className="w-full sm:w-auto"
              >
                {isGeneratingPDF ? 'A gerar...' : (contract ? "Atualizar" : "Criar")}
              </Button>
              {contract && formData.status === 'draft' && (
                <Button
                  type="button"
                  variant="default"
                  onClick={async () => {
                    await updateContract.mutateAsync({ 
                      id: contract.id, 
                      status: 'sent' as any 
                    });
                    toast.success("Contrato marcado como enviado!");
                  }}
                  className="w-full sm:w-auto"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Marcar como Enviado
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser revertida. O contrato será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!contract) return;
                await deleteContract.mutateAsync(contract.id);
                toast.success("Contrato eliminado com sucesso!");
                setShowDeleteDialog(false);
                actualOnOpenChange(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
