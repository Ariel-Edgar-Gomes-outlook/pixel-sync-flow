import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, FileText, FileSignature, Shield, CheckCircle2 } from "lucide-react";
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
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: contracts, isLoading } = useContracts();

  const handleEdit = (contract: any) => {
    setSelectedContract(contract);
    setDialogOpen(true);
  };

  const handleNewContract = () => {
    setSelectedContract(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setTimeout(() => setSelectedContract(null), 200);
  };

  const filteredContracts = contracts?.filter((contract) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      contract.clients?.name?.toLowerCase().includes(searchLower) ||
      contract.jobs?.title?.toLowerCase().includes(searchLower)
    );
  });

  const showEmptyState = !isLoading && (!contracts || contracts.length === 0);

  if (isLoading) {
    return <div className="space-y-6">Carregando...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Contratos</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie contratos de serviço e proteja seu trabalho legalmente
          </p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={handleNewContract}>
          <Plus className="h-4 w-4" />
          Novo Contrato
        </Button>
      </div>

      {showEmptyState ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <FileSignature className="h-12 w-12 text-primary" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Comece a formalizar seus trabalhos</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Crie contratos profissionais com termos, cláusulas e taxas de cancelamento. 
              Proteja-se e formalize acordos com seus clientes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-sm font-medium">Termos Claros</div>
                <div className="text-xs text-muted-foreground text-center">
                  Defina cláusulas e condições
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <Shield className="h-8 w-8 text-primary" />
                <div className="text-sm font-medium">Proteção Legal</div>
                <div className="text-xs text-muted-foreground text-center">
                  Taxa de cancelamento e políticas
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <CheckCircle2 className="h-8 w-8 text-primary" />
                <div className="text-sm font-medium">Assinatura Digital</div>
                <div className="text-xs text-muted-foreground text-center">
                  Registe quando foi assinado
                </div>
              </div>
            </div>

            <Button size="lg" className="gap-2" onClick={handleNewContract}>
              <Plus className="h-5 w-5" />
              Criar Primeiro Contrato
            </Button>

            <div className="mt-8 p-4 bg-muted/30 rounded-lg max-w-2xl">
              <p className="text-sm text-muted-foreground">
                <strong>Dica:</strong> Vincule contratos a jobs específicos e defina taxas de cancelamento 
                para proteger-se de desistências de última hora
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por cliente ou job..."
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
        <div className="text-center text-muted-foreground py-8">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium mb-1">Nenhum contrato encontrado</p>
          <p className="text-sm">Tente ajustar os termos de pesquisa</p>
        </div>
      )}
        </>
      )}

      <ContractDialog 
        contract={selectedContract} 
        open={dialogOpen} 
        onOpenChange={handleCloseDialog}
      />
    </div>
  );
}
