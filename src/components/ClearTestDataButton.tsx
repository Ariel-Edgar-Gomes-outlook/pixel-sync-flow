import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog";

export function ClearTestDataButton() {
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleClearData = async () => {
    setIsClearing(true);
    setShowConfirmDialog(false);
    
    const loadingToast = toast.loading("A eliminar dados de teste...");

    try {
      // Get the current session to ensure we have a valid token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.dismiss(loadingToast);
        toast.error("Você precisa estar autenticado para eliminar dados");
        return;
      }

      console.log("Invoking clear-test-data function...");
      
      const { data, error } = await supabase.functions.invoke("clear-test-data", {
        body: {},
      });

      console.log("Function response:", { data, error });

      if (error) throw error;

      toast.dismiss(loadingToast);
      toast.success(data.message || "Dados eliminados com sucesso!", {
        description: `${data.deletedCategories} categorias de dados foram eliminadas`,
      });

      // Recarregar a página após 1.5 segundos para atualizar todos os dados
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error: any) {
      console.error("Error clearing test data:", error);
      toast.dismiss(loadingToast);
      toast.error("Erro ao eliminar dados", {
        description: error.message || "Ocorreu um erro ao eliminar os dados de teste",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        size="lg"
        onClick={() => setShowConfirmDialog(true)}
        disabled={isClearing}
        className="w-full gap-2"
      >
        <Trash2 className="h-5 w-5" />
        Eliminar Dados de Teste
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Esta ação irá <strong>eliminar permanentemente</strong> todos os seus dados:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Clientes</li>
                <li>Jobs/Trabalhos</li>
                <li>Orçamentos</li>
                <li>Faturas</li>
                <li>Pagamentos</li>
                <li>Contratos</li>
                <li>Recursos/Equipamentos</li>
                <li>Membros da equipa</li>
                <li>Templates</li>
                <li>E todos os dados relacionados...</li>
              </ul>
              <p className="text-destructive font-semibold mt-3">
                ⚠️ Esta ação não pode ser revertida!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, eliminar tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
