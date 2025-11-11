import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { FileText, CheckCircle2, Eye, Loader2 } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { generateProfessionalContractPDF } from "@/lib/pdfGenerator";

interface ContractData {
  id: string;
  status: string;
  terms_text: string | null;
  usage_rights_text: string | null;
  cancellation_policy_text: string | null;
  revision_policy: string | null;
  clauses: any;
  
  clients: {
    name: string;
    email: string;
  };
  jobs: {
    title: string;
  } | null;
}

export default function ContractSign() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const signatureRef = useRef<SignatureCanvas>(null);
  
  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  useEffect(() => {
    loadContract();
  }, [token]);

  const loadContract = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          clients (name, email),
          jobs (title)
        `)
        .eq('signature_token', token)
        .single();

      if (error) throw error;

      if (data.status === 'signed') {
        setSigned(true);
      }

      setContract(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Contrato não encontrado",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!agreed) {
      toast({
        variant: "destructive",
        title: "Confirmação Necessária",
        description: "Você deve concordar com os termos antes de assinar",
      });
      return;
    }

    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      toast({
        variant: "destructive",
        title: "Assinatura Necessária",
        description: "Por favor, assine o contrato antes de continuar",
      });
      return;
    }

    setSigning(true);
    try {
      const signatureDataUrl = signatureRef.current.toDataURL();
      
      // Upload signature to storage
      const signatureBlob = await fetch(signatureDataUrl).then(r => r.blob());
      const signaturePath = `signatures/${contract!.id}_${Date.now()}.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(signaturePath, signatureBlob, {
          contentType: 'image/png',
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('contracts')
        .getPublicUrl(uploadData.path);
      
      // Update contract with signature
      const { error: updateError } = await supabase
        .from('contracts')
        .update({
          status: 'signed',
          signature_url: publicUrl,
          signed_at: new Date().toISOString(),
          signature_type: 'digital',
        })
        .eq('id', contract!.id);

      if (updateError) throw updateError;

      // Regenerate PDF with signature
      try {
        const { data: contractData } = await supabase
          .from('contracts')
          .select(`
            *,
            clients (name, email),
            jobs (title)
          `)
          .eq('id', contract!.id)
          .single();

        if (contractData) {
          const pdfUrl = await generateProfessionalContractPDF({
            id: contractData.id,
            client_name: contractData.clients.name,
            client_email: contractData.clients.email,
            job_title: contractData.jobs?.title,
            terms_text: contractData.terms_text || "",
            usage_rights_text: contractData.usage_rights_text,
            cancellation_policy_text: contractData.cancellation_policy_text,
            late_delivery_clause: contractData.late_delivery_clause,
            copyright_notice: contractData.copyright_notice,
            reschedule_policy: contractData.reschedule_policy,
            revision_policy: contractData.revision_policy,
            cancellation_fee: contractData.cancellation_fee,
            issued_at: contractData.issued_at,
            signed_at: contractData.signed_at,
            signature_url: publicUrl,
          });

          // Send signed copy email
          await supabase.functions.invoke('send-contract-email', {
            body: {
              contractId: contract!.id,
              type: 'signed_copy',
            },
          });
        }
      } catch (pdfError) {
        console.error('Failed to regenerate PDF:', pdfError);
      }
      
      setSigned(true);
      toast({
        title: "Contrato Assinado!",
        description: "O contrato foi assinado digitalmente com sucesso",
      });
    } catch (error: any) {
      console.error('Sign error:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao assinar contrato",
      });
    } finally {
      setSigning(false);
    }
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando contrato...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <h1 className="text-2xl font-bold mb-4">Contrato Não Encontrado</h1>
          <p>Este contrato não existe ou foi removido.</p>
        </Card>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-md">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Contrato Assinado!</h1>
          <p className="text-muted-foreground mb-4">
            O contrato foi assinado com sucesso. Uma cópia foi enviada para o seu email.
          </p>
          <p className="text-sm text-muted-foreground">
            Você pode fechar esta página.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Assinatura de Contrato</h1>
              <p className="text-muted-foreground">
                {contract.clients.name} - {contract.jobs?.title || 'Serviço'}
              </p>
            </div>
          </div>

          <div className="mb-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Revise os termos do contrato abaixo e assine no final da página.
            </p>
          </div>

          <div className="prose max-w-none mb-8">
            <h2>Termos e Condições</h2>
            {contract.terms_text && (
              <div className="whitespace-pre-wrap mb-4 p-4 bg-muted/30 rounded-lg">
                {contract.terms_text}
              </div>
            )}

            {contract.usage_rights_text && (
              <>
                <h3>Direitos de Uso de Imagem</h3>
                <p className="p-4 bg-muted/30 rounded-lg">{contract.usage_rights_text}</p>
              </>
            )}

            {contract.cancellation_policy_text && (
              <>
                <h3>Política de Cancelamento</h3>
                <p className="p-4 bg-muted/30 rounded-lg">{contract.cancellation_policy_text}</p>
              </>
            )}

            {contract.revision_policy && (
              <>
                <h3>Política de Revisões</h3>
                <p className="p-4 bg-muted/30 rounded-lg">{contract.revision_policy}</p>
              </>
            )}

            {contract.clauses && Object.keys(contract.clauses).length > 0 && (
              <>
                <h3>Cláusulas Adicionais</h3>
                <ul>
                  {Object.entries(contract.clauses).map(([key, value]) => (
                    <li key={key}>{String(value)}</li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="border-t pt-6">
            <div className="mb-6 flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Checkbox
                id="agree"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
              />
              <label
                htmlFor="agree"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Li e concordo com todos os termos e condições deste contrato. Estou ciente de que a assinatura digital tem a mesma validade jurídica que a assinatura física.
              </label>
            </div>

            <h3 className="text-lg font-semibold mb-4">Assinatura Digital</h3>
            <div className="border-2 border-dashed rounded-lg bg-white mb-4">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  className: 'w-full h-48',
                }}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={clearSignature}
                disabled={signing}
              >
                Limpar
              </Button>
              <Button
                onClick={handleSign}
                disabled={signing || !agreed}
              >
                {signing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Assinar Contrato"
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
