import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileText, CheckCircle2 } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";

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
      const signatureData = signatureRef.current.toDataURL();
      
      const { error } = await supabase
        .from('contracts')
        .update({
          status: 'signed',
          signature_url: signatureData,
          signed_at: new Date().toISOString(),
        })
        .eq('id', contract!.id);

      if (error) throw error;

      setSigned(true);
      toast({
        title: "Contrato Assinado!",
        description: "Você receberá uma cópia por email",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
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

          <div className="prose max-w-none mb-8">
            <h2>Termos e Condições</h2>
            {contract.terms_text && (
              <div className="whitespace-pre-wrap mb-4">{contract.terms_text}</div>
            )}

            {contract.usage_rights_text && (
              <>
                <h3>Direitos de Uso de Imagem</h3>
                <p>{contract.usage_rights_text}</p>
              </>
            )}

            {contract.cancellation_policy_text && (
              <>
                <h3>Política de Cancelamento</h3>
                <p>{contract.cancellation_policy_text}</p>
              </>
            )}

            {contract.revision_policy && (
              <>
                <h3>Política de Revisões</h3>
                <p>{contract.revision_policy}</p>
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
              >
                Limpar
              </Button>
              <Button
                onClick={handleSign}
                disabled={signing}
              >
                {signing ? "Processando..." : "Assinar Contrato"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
