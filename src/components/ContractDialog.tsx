import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCreateContract, useUpdateContract } from "@/hooks/useContracts";
import { useClients } from "@/hooks/useClients";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";
import { FileText, User, Briefcase, FileSignature, DollarSign } from "lucide-react";

interface Contract {
  id: string;
  client_id: string;
  job_id?: string | null;
  status: 'draft' | 'sent' | 'signed' | 'cancelled';
  terms_text?: string;
  issued_at?: string;
  signed_at?: string | null;
  cancellation_fee?: number;
  clauses?: any;
  clients?: { id: string; name: string };
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
  const [formData, setFormData] = useState({
    client_id: "",
    job_id: null as string | null,
    status: "draft" as Contract['status'],
    terms_text: "",
    cancellation_fee: 0,
  });

  const createContract = useCreateContract();
  const updateContract = useUpdateContract();
  const { data: clients } = useClients();
  const { data: jobs } = useJobs();

  const actualOpen = open !== undefined ? open : isOpen;
  const actualOnOpenChange = onOpenChange || setIsOpen;

  useEffect(() => {
    if (contract) {
      setFormData({
        client_id: contract.client_id,
        job_id: contract.job_id || null,
        status: contract.status,
        terms_text: contract.terms_text || "",
        cancellation_fee: Number(contract.cancellation_fee) || 0,
      });
    }
  }, [contract]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id) {
      toast.error("Selecione um cliente");
      return;
    }

    try {
      if (contract) {
        await updateContract.mutateAsync({ id: contract.id, ...formData });
        toast.success("Contrato atualizado!");
      } else {
        await createContract.mutateAsync(formData);
        toast.success("Contrato criado!");
      }
      actualOnOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error("Erro ao salvar contrato");
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: "",
      job_id: null,
      status: "draft",
      terms_text: "",
      cancellation_fee: 0,
    });
  };

  return (
    <Dialog open={actualOpen} onOpenChange={actualOnOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            {contract ? "Editar Contrato" : "Novo Contrato"}
          </DialogTitle>
          <DialogDescription>
            {contract 
              ? "Atualize as informações do contrato de serviço"
              : "Crie um novo contrato de serviço com termos e condições formalizadas"
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seção: Informações do Contrato */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Informações do Contrato</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client" className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  Cliente *
                </Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value })}
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
                <p className="text-xs text-muted-foreground">Cliente que assinará o contrato</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job" className="flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5" />
                  Job (Opcional)
                </Label>
                <Select
                  value={formData.job_id || "none"}
                  onValueChange={(value) => setFormData({ ...formData, job_id: value === "none" ? null : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o job" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem job</SelectItem>
                    {jobs?.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Associe a um job específico se necessário</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Seção: Estado e Valores */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Estado e Valores</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  Estado do Contrato
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Contract['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="sent">Enviado</SelectItem>
                    <SelectItem value="signed">Assinado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Estado atual do contrato</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancellation_fee" className="flex items-center gap-2">
                  <DollarSign className="h-3.5 w-3.5" />
                  Taxa de Cancelamento (Kz)
                </Label>
                <Input
                  id="cancellation_fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cancellation_fee}
                  onChange={(e) => setFormData({ ...formData, cancellation_fee: Number(e.target.value) })}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">Valor cobrado em caso de cancelamento</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Seção: Termos e Condições */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <FileSignature className="h-4 w-4" />
              <span>Termos e Condições</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms_text" className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                Termos do Contrato
              </Label>
              <Textarea
                id="terms_text"
                rows={10}
                placeholder="Descreva os termos e condições do contrato de serviço...&#10;&#10;Exemplo:&#10;- Escopo do serviço&#10;- Prazo de entrega&#10;- Condições de pagamento&#10;- Direitos de uso das imagens&#10;- Política de cancelamento"
                value={formData.terms_text}
                onChange={(e) => setFormData({ ...formData, terms_text: e.target.value })}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Defina claramente os termos, escopo, prazos e condições do serviço
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => actualOnOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createContract.isPending || updateContract.isPending}>
              {contract ? "Atualizar" : "Criar"} Contrato
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}