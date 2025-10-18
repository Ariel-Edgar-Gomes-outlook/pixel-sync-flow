import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateContract, useUpdateContract } from "@/hooks/useContracts";
import { useClients } from "@/hooks/useClients";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";

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
          <DialogTitle className="text-lg sm:text-xl">{contract ? "Editar Contrato" : "Novo Contrato"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente *</Label>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="job">Job (Opcional)</Label>
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
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="cancellation_fee">Taxa de Cancelamento (Kz)</Label>
              <Input
                id="cancellation_fee"
                type="number"
                min="0"
                step="0.01"
                value={formData.cancellation_fee}
                onChange={(e) => setFormData({ ...formData, cancellation_fee: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms_text">Termos e Condições</Label>
            <Textarea
              id="terms_text"
              rows={10}
              placeholder="Descreva os termos do contrato..."
              value={formData.terms_text}
              onChange={(e) => setFormData({ ...formData, terms_text: e.target.value })}
            />
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