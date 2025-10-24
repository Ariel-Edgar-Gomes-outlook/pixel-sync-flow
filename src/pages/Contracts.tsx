import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, FileText, FileSignature, Shield, CheckCircle2, Link2, Send, Eye, Users, Briefcase } from "lucide-react";
import { useContracts } from "@/hooks/useContracts";
import { ContractDialog } from "@/components/ContractDialog";
import { PDFViewerDialog } from '@/components/PDFViewerDialog';
import { EntityQuickLinks } from "@/components/EntityQuickLinks";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const statusConfig = {
  draft: { label: "Rascunho", variant: "secondary" as const },
  sent: { label: "Enviado", variant: "default" as const },
  pending_signature: { label: "Aguardando Assinatura", variant: "warning" as const },
  signed: { label: "Assinado", variant: "success" as const },
  active: { label: "Ativo", variant: "success" as const },
  cancelled: { label: "Cancelado", variant: "destructive" as const },
};

export default function Contracts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContract, setSelectedContract] = useState<any>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState<string>('');
  const { data: contracts, isLoading } = useContracts();
  const { toast } = useToast();

  useEffect(() => {
    const handleOpenPDFViewer = (event: any) => {
      setSelectedPdfUrl(event.detail.url);
      setPdfTitle(event.detail.title);
      setPdfViewerOpen(true);
    };

    window.addEventListener('openPDFViewer', handleOpenPDFViewer);
    return () => window.removeEventListener('openPDFViewer', handleOpenPDFViewer);
  }, []);

  const handleEdit = (contract: any) => {
    setSelectedContract(contract);
    setDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedContract(undefined);
    }
  };

  const copySignatureLink = (contract: any) => {
    const baseUrl = window.location.origin;
    const signatureUrl = `${baseUrl}/contract/sign/${contract.signature_token}`;
    
    navigator.clipboard.writeText(signatureUrl);
    toast({
      title: "Link copiado!",
      description: "O link de assinatura foi copiado para a área de transferência",
    });
  };

  const sendForSignature = async (contract: any) => {
    try {
      const { error } = await supabase
        .from('contracts')
        .update({ status: 'sent' })
        .eq('id', contract.id);

      if (error) throw error;

      const baseUrl = window.location.origin;
      const signatureUrl = `${baseUrl}/contract/sign/${contract.signature_token}`;
      
      toast({
        title: "Contrato enviado!",
        description: `Link de assinatura: ${signatureUrl}`,
        duration: 10000,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    }
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
        <ContractDialog contract={selectedContract} open={dialogOpen} onOpenChange={handleOpenChange}>
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Novo Contrato
          </Button>
        </ContractDialog>
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

            <ContractDialog contract={selectedContract} open={dialogOpen} onOpenChange={handleOpenChange}>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Criar Primeiro Contrato
              </Button>
            </ContractDialog>

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
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg truncate">
                    {contract.clients?.name || 'Cliente não especificado'}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant={statusConfig[contract.status as keyof typeof statusConfig]?.variant || 'default'}>
                      {statusConfig[contract.status as keyof typeof statusConfig]?.label || contract.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <EntityQuickLinks 
                  links={[
                    { type: 'client', id: contract.client_id, name: contract.clients?.name || 'Cliente' },
                    ...(contract.job_id ? [{ type: 'job' as const, id: contract.job_id, name: contract.jobs?.title || 'Job' }] : []),
                  ]}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Emitido:</span>
                    <p className="font-medium">
                      {new Date(contract.issued_at || contract.created_at).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                  {contract.signed_at && (
                    <div>
                      <span className="text-muted-foreground">Assinado:</span>
                      <p className="font-medium text-success">
                        {new Date(contract.signed_at).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  )}
                  {contract.cancellation_fee && (
                    <div>
                      <span className="text-muted-foreground">Taxa Cancelamento:</span>
                      <p className="font-medium">Kz {Number(contract.cancellation_fee).toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {contract.pdf_url && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedPdfUrl(contract.pdf_url);
                      setPdfTitle(`Contrato - ${contract.clients?.name || 'Cliente'}`);
                      setPdfViewerOpen(true);
                    }}
                  >
                    <FileText className="h-3 w-3 sm:mr-2" />
                    <span className="hidden sm:inline">Ver PDF</span>
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(contract)}
                >
                  <Edit className="h-3 w-3 sm:mr-2" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
                
                {!['signed', 'active', 'cancelled'].includes(contract.status) && (
                  <>
                    <Button 
                      onClick={() => copySignatureLink(contract)} 
                      variant="outline"
                      size="sm"
                    >
                      <Link2 className="h-3 w-3 sm:mr-2" />
                      <span className="hidden sm:inline">Link</span>
                    </Button>
                    <Button 
                      onClick={() => sendForSignature(contract)} 
                      variant="default"
                      size="sm"
                    >
                      <Send className="h-3 w-3 sm:mr-2" />
                      <span className="hidden sm:inline">Enviar</span>
                    </Button>
                  </>
                )}
              </div>
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
        onOpenChange={handleOpenChange}
      />

      <PDFViewerDialog
        open={pdfViewerOpen}
        onOpenChange={setPdfViewerOpen}
        pdfUrl={selectedPdfUrl}
        title={pdfTitle}
      />
    </div>
  );
}