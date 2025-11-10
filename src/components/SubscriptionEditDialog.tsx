import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, Trash2, Ban, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  is_suspended?: boolean;
  suspension_reason?: string | null;
  admin_notes?: string | null;
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [suspensionReason, setSuspensionReason] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setAdminNotes(profile.admin_notes || "");
      setSuspensionReason(profile.suspension_reason || "");
      
      if (profile.subscription_start_date) {
        const startDateTime = new Date(profile.subscription_start_date);
        setStartDate(format(startDateTime, "yyyy-MM-dd'T'HH:mm"));
      }
      if (profile.subscription_end_date) {
        const endDateTime = new Date(profile.subscription_end_date);
        setEndDate(format(endDateTime, "yyyy-MM-dd'T'HH:mm"));
      }
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name,
          email,
          phone: phone || null,
          admin_notes: adminNotes || null,
        })
        .eq("user_id", profile.user_id);

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso!");
      onUpdate();
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscription = async (e: React.FormEvent) => {
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

  const handleDelete = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      // Primeiro deletar o usuário da autenticação (se necessário)
      // Depois deletar o perfil
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", profile.user_id);

      if (error) throw error;

      toast.success("Utilizador eliminado com sucesso!");
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao eliminar utilizador:", error);
      toast.error("Erro ao eliminar utilizador", {
        description: error.message,
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleSuspend = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_suspended: !profile.is_suspended,
          suspension_reason: !profile.is_suspended ? suspensionReason : null,
        })
        .eq("user_id", profile.user_id);

      if (error) throw error;

      toast.success(
        profile.is_suspended 
          ? "Conta reativada com sucesso!" 
          : "Conta suspensa com sucesso!"
      );
      onUpdate();
      setSuspendDialogOpen(false);
    } catch (error: any) {
      console.error("Erro ao suspender/reativar conta:", error);
      toast.error("Erro ao alterar estado da conta", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Gerir Utilizador
              {profile.is_suspended && (
                <Badge variant="destructive" className="ml-2">
                  <Ban className="h-3 w-3 mr-1" />
                  Suspenso
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="subscription">Assinatura</TabsTrigger>
              <TabsTrigger value="admin">Administração</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "A guardar..." : "Guardar Perfil"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-4">
              <form onSubmit={handleUpdateSubscription} className="space-y-4">
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
                  {loading ? "A guardar..." : "Guardar Assinatura"}
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
            </TabsContent>

            <TabsContent value="admin" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin_notes">Notas Administrativas</Label>
                  <Textarea
                    id="admin_notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Adicione notas sobre este utilizador..."
                    rows={4}
                  />
                  <Button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleUpdateProfile(e);
                    }} 
                    disabled={loading}
                    size="sm"
                  >
                    Guardar Notas
                  </Button>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <p className="text-sm font-medium mb-2">Ações Perigosas:</p>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setSuspendDialogOpen(true)}
                    disabled={loading}
                  >
                    {profile.is_suspended ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Reativar Conta
                      </>
                    ) : (
                      <>
                        <Ban className="h-4 w-4 mr-2 text-orange-600" />
                        Suspender Conta
                      </>
                    )}
                  </Button>

                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Utilizador
                  </Button>
                </div>

                {profile.is_suspended && profile.suspension_reason && (
                  <div className="bg-destructive/10 p-3 rounded-md">
                    <p className="text-sm font-medium text-destructive mb-1">
                      Motivo da Suspensão:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {profile.suspension_reason}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Eliminar Utilizador?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar <strong>{profile?.name}</strong>?
              <br /><br />
              Esta ação é <strong>irreversível</strong> e irá eliminar:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Todos os dados do utilizador</li>
                <li>Histórico de assinaturas</li>
                <li>Todos os registos associados</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "A eliminar..." : "Sim, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend Confirmation Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {profile?.is_suspended ? "Reativar" : "Suspender"} Conta?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {profile?.is_suspended ? (
                <>
                  Deseja reativar a conta de <strong>{profile?.name}</strong>?
                  <br />
                  O utilizador voltará a ter acesso ao sistema.
                </>
              ) : (
                <>
                  Deseja suspender a conta de <strong>{profile?.name}</strong>?
                  <br /><br />
                  <Label htmlFor="suspension_reason">Motivo da Suspensão:</Label>
                  <Textarea
                    id="suspension_reason"
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    placeholder="Ex: Pagamento em atraso, violação de termos, etc."
                    className="mt-2"
                    rows={3}
                  />
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              disabled={loading}
              className={profile?.is_suspended ? "" : "bg-orange-600 hover:bg-orange-700"}
            >
              {loading ? "A processar..." : profile?.is_suspended ? "Reativar" : "Suspender"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
