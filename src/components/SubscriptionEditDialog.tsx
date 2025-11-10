import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
}

interface SubscriptionEditDialogProps {
  profile: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function SubscriptionEditDialog({ 
  profile, 
  open, 
  onOpenChange, 
  onUpdate 
}: SubscriptionEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_start_date: startDate || null,
          subscription_end_date: endDate || null,
        })
        .eq("user_id", profile.user_id);

      if (error) throw error;

      toast.success("Assinatura atualizada com sucesso!");
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao atualizar assinatura:", error);
      toast.error("Erro ao atualizar assinatura", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExtend = async (days: number) => {
    if (!profile) return;

    setLoading(true);
    try {
      const currentEnd = profile.subscription_end_date 
        ? new Date(profile.subscription_end_date)
        : new Date();
      
      const newEnd = new Date(currentEnd.getTime() + days * 24 * 60 * 60 * 1000);

      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_end_date: newEnd.toISOString(),
        })
        .eq("user_id", profile.user_id);

      if (error) throw error;

      toast.success(`Assinatura estendida por ${days} dias!`);
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao estender assinatura:", error);
      toast.error("Erro ao estender assinatura", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlimited = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: null,
        })
        .eq("user_id", profile.user_id);

      if (error) throw error;

      toast.success("Acesso ilimitado concedido!");
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao conceder acesso ilimitado:", error);
      toast.error("Erro ao conceder acesso ilimitado", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerir Assinatura</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Utilizador:</strong> {profile.name}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Email:</strong> {profile.email}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data de Início</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Data de início da assinatura"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Data de Término</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Data de término da assinatura"
              />
              <p className="text-xs text-muted-foreground">
                Deixe em branco para acesso ilimitado
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "A guardar..." : "Guardar Alterações"}
            </Button>
          </form>

          <div className="border-t pt-4 space-y-2">
            <p className="text-sm font-medium mb-2">Ações Rápidas:</p>
            
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExtend(30)}
                disabled={loading}
              >
                +30 dias
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExtend(90)}
                disabled={loading}
              >
                +90 dias
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExtend(365)}
                disabled={loading}
              >
                +1 ano
              </Button>
            </div>

            <Button
              variant="secondary"
              className="w-full"
              onClick={handleUnlimited}
              disabled={loading}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Conceder Acesso Ilimitado
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
