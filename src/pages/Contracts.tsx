import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileText, FileSignature, Shield, CheckCircle2 } from "lucide-react";
import { useContracts } from "@/hooks/useContracts";
import { ContractDialog } from "@/components/ContractDialog";
import { PDFViewerDialog } from '@/components/PDFViewerDialog';
import { ContractCard } from "@/components/ContractCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Contracts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContract, setSelectedContract] = useState<any>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedPdfSource, setSelectedPdfSource] = useState<any>(null);
  const { data: contracts, isLoading } = useContracts();
  const { toast } = useToast();

  useEffect(() => {
    const handleOpenPDFViewer = (event: any) => {
      if (event.detail.pdfSource) {
        setSelectedPdfSource(event.detail.pdfSource);
      } else if (event.detail.url) {
        setSelectedPdfSource({ type: 'url', url: event.detail.url });
      }
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

  const handleViewPDF = (contract: any) => {
    setSelectedPdfSource({
      type: 'local',
      entityType: 'contract',
      entityId: contract.id
    });
    setPdfViewerOpen(true);
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
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-8">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <FileSignature className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary">Gestão Legal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Contratos</h1>
            <p className="text-muted-foreground">
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
      </div>

      {showEmptyState ? (
        <Card className="border-dashed border-primary/20 bg-gradient-to-br from-card to-card/50">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-6 mb-6">
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
              <ContractCard
                key={contract.id}
                contract={contract}
                onEdit={handleEdit}
                onCopyLink={copySignatureLink}
                onSendForSignature={sendForSignature}
                onViewPDF={handleViewPDF}
              />
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
        pdfSource={selectedPdfSource}
      />
    </div>
  );
}
