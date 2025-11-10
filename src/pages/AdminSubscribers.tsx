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
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between gap-2 mb-3 md:mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-2 shrink-0"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Gestão de Assinantes</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Administração de todos os utilizadores do sistema
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
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

        {/* Subscribers List */}
        <Card>
          <CardHeader className="space-y-4">
            <div>
              <CardTitle className="text-lg md:text-xl">Lista de Assinantes</CardTitle>
              <CardDescription className="text-sm">
                Gerir todos os utilizadores do sistema
              </CardDescription>
            </div>
            
            <div className="space-y-3">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                  className="shrink-0"
                >
                  Todos ({profiles.length})
                </Button>
                <Button
                  variant={filterStatus === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("active")}
                  className="shrink-0"
                >
                  Ativas ({stats.active})
                </Button>
                <Button
                  variant={filterStatus === "expired" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("expired")}
                  className="shrink-0"
                >
                  Expiradas ({stats.expired})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="gap-1 shrink-0"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="px-0 md:px-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground px-4">
                Nenhum utilizador encontrado
              </div>
            ) : (
              <>
                {/* Mobile View - Cards */}
                <div className="md:hidden space-y-3 px-4">
                  {filteredProfiles.map((profile) => (
                    <Card key={profile.id} className={profile.is_suspended ? "opacity-60" : ""}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold truncate">{profile.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSubscription(profile)}
                            className="shrink-0"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          {!profile.subscription_end_date ? (
                            <Badge className="bg-blue-600 text-xs">Ilimitada</Badge>
                          ) : isSubscriptionActive(profile.subscription_end_date) ? (
                            <Badge variant="default" className="bg-green-600 text-xs">Ativa</Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">Expirada</Badge>
                          )}
                          
                          {profile.is_suspended && (
                            <Badge variant="destructive" className="text-xs">
                              <Ban className="h-3 w-3 mr-1" />
                              Suspenso
                            </Badge>
                          )}
                          
                          <span className="text-xs text-muted-foreground">
                            {getDaysRemaining(profile.subscription_end_date)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Telefone:</span>
                            <p className="font-medium">{profile.phone || "-"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Registo:</span>
                            <p className="font-medium">
                              {format(new Date(profile.created_at), "dd/MM/yyyy")}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Início:</span>
                            <p className="font-medium">
                              {profile.subscription_start_date
                                ? format(new Date(profile.subscription_start_date), "dd/MM/yyyy")
                                : "-"}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Término:</span>
                            <p className="font-medium">
                              {profile.subscription_end_date
                                ? format(new Date(profile.subscription_end_date), "dd/MM/yyyy")
                                : "Ilimitado"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Registo</TableHead>
                        <TableHead>Início</TableHead>
                        <TableHead>Término</TableHead>
                        <TableHead>Dias</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="w-[60px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfiles.map((profile) => (
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
                          <TableCell className="text-sm font-medium whitespace-nowrap">
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
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
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
