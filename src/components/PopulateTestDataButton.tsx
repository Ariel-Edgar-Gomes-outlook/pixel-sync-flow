import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function PopulateTestDataButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const handlePopulate = async () => {
    setIsLoading(true);
    toast.loading("A popular base de dados...");

    try {
      // Get the current session to ensure we have a valid token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.dismiss();
        toast.error("Você precisa estar autenticado para popular a base de dados");
        return;
      }

      console.log("Invoking populate-test-data function...");
      
      const { data, error } = await supabase.functions.invoke("populate-test-data", {
        body: {},
      });

      console.log("Function response:", { data, error });

      if (error) throw error;

      toast.dismiss();
      toast.success("Base de dados populada com sucesso!");
      setSummary(data.summary);
      
      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error("Error populating data:", error);
      toast.dismiss();
      toast.error("Erro ao popular dados: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Dados de Teste</h2>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">
          Popular a base de dados com dados fictícios angolanos para testar o sistema (clientes, trabalhos, equipamentos, etc.)
        </p>

        {summary && (
          <div className="mb-6 p-4 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-success" />
              <p className="font-semibold text-success">Dados criados com sucesso!</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Clientes:</span> <span className="font-medium">{summary.clients}</span></div>
              <div><span className="text-muted-foreground">Jobs:</span> <span className="font-medium">{summary.jobs}</span></div>
              <div><span className="text-muted-foreground">Recursos:</span> <span className="font-medium">{summary.resources}</span></div>
              <div><span className="text-muted-foreground">Leads:</span> <span className="font-medium">{summary.leads}</span></div>
              <div><span className="text-muted-foreground">Orçamentos:</span> <span className="font-medium">{summary.quotes}</span></div>
              <div><span className="text-muted-foreground">Faturas:</span> <span className="font-medium">{summary.invoices}</span></div>
              <div><span className="text-muted-foreground">Pagamentos:</span> <span className="font-medium">{summary.payments}</span></div>
              <div><span className="text-muted-foreground">Contratos:</span> <span className="font-medium">{summary.contracts}</span></div>
            </div>
          </div>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              className="w-full gap-2" 
              disabled={isLoading}
              variant={summary ? "outline" : "default"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  A popular...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  {summary ? "Popular Novamente" : "Popular Base de Dados"}
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Popular Base de Dados com Dados de Teste?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>Isto irá adicionar aproximadamente:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>45 Clientes angolanos (pessoas e empresas)</li>
                  <li>25 Trabalhos/Jobs com diferentes status</li>
                  <li>20 Equipamentos fotográficos</li>
                  <li>15 Leads/Potenciais Clientes</li>
                  <li>20 Orçamentos</li>
                  <li>18 Faturas</li>
                  <li>25 Pagamentos</li>
                  <li>12 Contratos</li>
                  <li>E muito mais...</li>
                </ul>
                <p className="mt-4 text-warning">
                  <strong>Atenção:</strong> Estes dados são fictícios e podem ser eliminados posteriormente.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handlePopulate}>
                Confirmar e Popular
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}