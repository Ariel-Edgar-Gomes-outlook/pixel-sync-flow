import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, UserCheck, UserX, LogOut, Settings, Search, TrendingUp, Clock, Download, Ban } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SubscriptionEditDialog } from "@/components/SubscriptionEditDialog";
import { toast } from "sonner";

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  created_at: string;
  is_suspended?: boolean;
  suspension_reason?: string | null;
  admin_notes?: string | null;
}

const AdminSubscribers = () => {
  const navigate = useNavigate();
  const { signOut } = useAdminAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    unlimited: 0,
    expiringSoon: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "expired">("all");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProfiles(data || []);

      // Calculate stats
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const unlimited = data?.filter(p => !p.subscription_end_date).length || 0;
      const active = data?.filter(p => {
        if (!p.subscription_end_date) return false;
        return new Date(p.subscription_end_date) > now;
      }).length || 0;
      const expiringSoon = data?.filter(p => {
        if (!p.subscription_end_date) return false;
        const endDate = new Date(p.subscription_end_date);
        return endDate > now && endDate <= sevenDaysFromNow;
      }).length || 0;

      setStats({
        total: data?.length || 0,
        active,
        expired: (data?.length || 0) - active - unlimited,
        unlimited,
        expiringSoon,
      });
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const isSubscriptionActive = (endDate: string | null) => {
    if (!endDate) return false;
    return new Date(endDate) > new Date();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleEditSubscription = (profile: Profile) => {
    setSelectedProfile(profile);
    setEditDialogOpen(true);
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = 
      profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterStatus === "all") return true;
    if (filterStatus === "active") {
      if (!profile.subscription_end_date) return true;
      return isSubscriptionActive(profile.subscription_end_date);
    }
    if (filterStatus === "expired") {
      if (!profile.subscription_end_date) return false;
      return !isSubscriptionActive(profile.subscription_end_date);
    }

    return true;
  });

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return "Ilimitado";
    const days = differenceInDays(new Date(endDate), new Date());
    if (days < 0) return "Expirado";
    if (days === 0) return "Expira hoje";
    if (days === 1) return "1 dia";
    return `${days} dias`;
  };

  const handleExportCSV = () => {
    try {
      const headers = ["Nome", "Email", "Telefone", "Data Registo", "Início Assinatura", "Término Assinatura", "Estado", "Suspenso"];
      const rows = filteredProfiles.map(p => [
        p.name,
        p.email,
        p.phone || "",
        format(new Date(p.created_at), "dd/MM/yyyy"),
        p.subscription_start_date ? format(new Date(p.subscription_start_date), "dd/MM/yyyy") : "",
        p.subscription_end_date ? format(new Date(p.subscription_end_date), "dd/MM/yyyy") : "Ilimitado",
        isSubscriptionActive(p.subscription_end_date) ? "Ativa" : "Expirada",
        p.is_suspended ? "Sim" : "Não"
      ]);

      const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `assinantes_${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
      
      toast.success("Exportação concluída!");
    } catch (error) {
      toast.error("Erro ao exportar dados");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
          <h1 className="text-3xl font-bold">Gestão de Assinantes</h1>
          <p className="text-muted-foreground mt-2">
            Administração de todos os utilizadores do sistema
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativas</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiradas</CardTitle>
              <UserX className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.expired}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ilimitadas</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.unlimited}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">A Expirar (7d)</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</div>
            </CardContent>
          </Card>
        </div>

        {/* Subscribers Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Lista de Assinantes</CardTitle>
                <CardDescription>
                  Gerir e visualizar todos os utilizadores do sistema
                </CardDescription>
              </div>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={filterStatus === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("all")}
                  >
                    Todos ({profiles.length})
                  </Button>
                  <Button
                    variant={filterStatus === "active" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("active")}
                  >
                    Ativas ({stats.active})
                  </Button>
                  <Button
                    variant={filterStatus === "expired" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("expired")}
                  >
                    Expiradas ({stats.expired})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exportar CSV
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Data de Registo</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Término</TableHead>
                      <TableHead>Dias Restantes</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          Nenhum utilizador encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProfiles.map((profile) => (
                        <TableRow key={profile.id} className={profile.is_suspended ? "opacity-60" : ""}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {profile.name}
                              {profile.is_suspended && (
                                <Badge variant="destructive" className="text-xs">
                                  <Ban className="h-3 w-3 mr-1" />
                                  Suspenso
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{profile.email}</TableCell>
                          <TableCell>{profile.phone || "-"}</TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(profile.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-sm">
                            {profile.subscription_start_date
                              ? format(new Date(profile.subscription_start_date), "dd/MM/yyyy", { locale: ptBR })
                              : "-"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {profile.subscription_end_date
                              ? format(new Date(profile.subscription_end_date), "dd/MM/yyyy", { locale: ptBR })
                              : "Ilimitado"}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {getDaysRemaining(profile.subscription_end_date)}
                          </TableCell>
                          <TableCell>
                            {!profile.subscription_end_date ? (
                              <Badge className="bg-blue-600">Ilimitada</Badge>
                            ) : isSubscriptionActive(profile.subscription_end_date) ? (
                              <Badge variant="default" className="bg-green-600">
                                Ativa
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Expirada</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSubscription(profile)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <SubscriptionEditDialog
        profile={selectedProfile}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdate={fetchProfiles}
      />
    </div>
  );
};

export default AdminSubscribers;
