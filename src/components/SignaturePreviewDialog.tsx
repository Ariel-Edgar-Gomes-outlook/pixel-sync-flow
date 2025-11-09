import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, FileText, Receipt, FileSignature } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SignaturePreviewDialogProps {
  signatureUrl: string | null;
}

export function SignaturePreviewDialog({ signatureUrl }: SignaturePreviewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <Eye className="h-4 w-4 mr-2" />
          Ver Exemplos de Uso
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Onde a assinatura é utilizada</DialogTitle>
          <DialogDescription>
            A sua assinatura digital aparece automaticamente nos seguintes documentos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Contratos */}
          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-500 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Contratos Profissionais</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  A assinatura aparece na secção de assinaturas do contrato, junto com o nome e cargo do representante legal.
                </p>
                <div className="bg-muted/30 p-3 rounded-lg border">
                  <p className="text-xs font-mono text-muted-foreground mb-2">Exemplo:</p>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      {signatureUrl ? (
                        <img src={signatureUrl} alt="Assinatura" className="h-16 mx-auto mb-2" />
                      ) : (
                        <div className="h-16 w-32 bg-muted rounded mb-2 flex items-center justify-center">
                          <FileSignature className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="text-xs border-t border-foreground pt-1">
                        <p className="font-semibold">CONTRATANTE</p>
                        <p className="text-muted-foreground">Sua Empresa</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="h-16 w-32 bg-muted rounded mb-2"></div>
                      <div className="text-xs border-t border-foreground pt-1">
                        <p className="font-semibold">CONTRATADO</p>
                        <p className="text-muted-foreground">Cliente</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Recibos */}
          <Card className="p-4 border-l-4 border-l-green-500">
            <div className="flex items-start gap-3">
              <Receipt className="h-5 w-5 text-green-500 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Recibos de Pagamento</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  A assinatura aparece no rodapé do recibo, validando o pagamento recebido.
                </p>
                <div className="bg-muted/30 p-3 rounded-lg border">
                  <p className="text-xs font-mono text-muted-foreground mb-2">Exemplo de rodapé:</p>
                  <div className="flex items-center gap-4">
                    {signatureUrl ? (
                      <img src={signatureUrl} alt="Assinatura" className="h-12" />
                    ) : (
                      <div className="h-12 w-24 bg-muted rounded flex items-center justify-center">
                        <FileSignature className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="text-xs">
                      <div className="border-b border-foreground w-32 mb-1"></div>
                      <p className="text-muted-foreground">Assinatura Autorizada</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Faturas */}
          <Card className="p-4 border-l-4 border-l-orange-500">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-orange-500 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Faturas e Proformas</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  A assinatura aparece no rodapé das faturas e proformas, dando validade legal ao documento.
                </p>
                <div className="bg-muted/30 p-3 rounded-lg border">
                  <p className="text-xs font-mono text-muted-foreground mb-2">Exemplo de rodapé:</p>
                  <div className="flex items-center gap-4">
                    {signatureUrl ? (
                      <img src={signatureUrl} alt="Assinatura" className="h-12" />
                    ) : (
                      <div className="h-12 w-24 bg-muted rounded flex items-center justify-center">
                        <FileSignature className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="text-xs">
                      <div className="border-b border-foreground w-32 mb-1"></div>
                      <p className="text-muted-foreground">Assinatura Autorizada</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {!signatureUrl && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950 p-4">
              <p className="text-sm text-orange-900 dark:text-orange-100">
                <strong>💡 Dica:</strong> Carregue uma assinatura PNG com fundo transparente para que ela apareça automaticamente em todos os seus documentos.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
