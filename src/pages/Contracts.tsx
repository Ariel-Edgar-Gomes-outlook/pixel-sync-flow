import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, FileText } from "lucide-react";
import { useContracts } from "@/hooks/useContracts";
import { ContractDialog } from "@/components/ContractDialog";

const statusConfig = {
  draft: { label: "Rascunho", variant: "secondary" as const },
  sent: { label: "Enviado", variant: "primary" as const },
  signed: { label: "Assinado", variant: "success" as const },
  cancelled: { label: "Cancelado", variant: "destructive" as const },
};

export default function Contracts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContract, setSelectedContract] = useState<any>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: contracts, isLoading } = useContracts();

  const handleEdit = (contract: any) => {
    setSelectedContract(contract);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedContract(undefined);
  };

  const filteredContracts = contracts?.filter((contract) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      contract.clients?.name?.toLowerCase().includes(searchLower) ||
      contract.jobs?.title?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return <div className="space-y-6">Carregando...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Contratos</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gerencie contratos de serviço
          </p>
        </div>
        <ContractDialog contract={selectedContract} open={dialogOpen} onOpenChange={handleCloseDialog}>
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Novo Contrato
          </Button>
        </ContractDialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Procurar contratos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4 grid-cols-1">
        {filteredContracts?.map((contract) => (
          <Card key={contract.id} className="p-4 sm:p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground text-base sm:text-lg">
                    {contract.clients?.name || 'Cliente não especificado'}
                  </h3>
                  <Badge variant={statusConfig[contract.status as keyof typeof statusConfig]?.variant || 'default'}>
                    {statusConfig[contract.status as keyof typeof statusConfig]?.label || contract.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  {contract.jobs && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Job:</span>
                      <span className="font-medium">{contract.jobs.title}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Emitido:</span>
                    <span className="font-medium">
                      {new Date(contract.issued_at || contract.created_at).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                  {contract.signed_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Assinado:</span>
                      <span className="font-medium text-success">
                        {new Date(contract.signed_at).toLocaleDateString('pt-PT')}
                      </span>
                    </div>
                  )}
                  {contract.cancellation_fee && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Taxa Cancelamento:</span>
                      <span className="font-medium">Kz {Number(contract.cancellation_fee).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(contract)}
                className="gap-2"
              >
                <Edit className="h-3 w-3" />
                Editar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredContracts?.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum contrato encontrado</p>
          </div>
        </Card>
      )}
    </div>
  );
}
