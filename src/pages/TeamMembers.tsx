import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Archive, 
  ArchiveRestore,
  BarChart3,
  Briefcase,
  Clock,
  Mail,
  Phone
} from "lucide-react";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { TeamMemberDialog } from "@/components/TeamMemberDialog";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TeamMembers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);

  const { data: teamMembers, isLoading } = useTeamMembers();

  // Query para pegar estatísticas de um membro
  const { data: memberStats } = useQuery({
    queryKey: ['member-stats', selectedMember?.id],
    queryFn: async () => {
      if (!selectedMember?.id) return null;

      // Buscar todos os projetos onde este membro está alocado
      const { data: jobAssignments, error } = await supabase
        .from('job_team_members')
        .select(`
          *,
          jobs (
            id,
            title,
            type,
            status,
            start_datetime,
            end_datetime,
            time_spent
          )
        `)
        .eq('team_member_id', selectedMember.id);

      if (error) throw error;

      const totalProjects = jobAssignments?.length || 0;
      const activeProjects = jobAssignments?.filter((j: any) => 
        j.jobs?.status === 'in_progress' || j.jobs?.status === 'scheduled'
      ).length || 0;
      const completedProjects = jobAssignments?.filter((j: any) => 
        j.jobs?.status === 'completed'
      ).length || 0;
      const totalHours = jobAssignments?.reduce((sum: number, j: any) => 
        sum + (Number(j.jobs?.time_spent) || 0), 0
      ) || 0;

      return {
        totalProjects,
        activeProjects,
        completedProjects,
        totalHours,
        projects: jobAssignments?.map((j: any) => j.jobs).filter(Boolean) || []
      };
    },
    enabled: !!selectedMember?.id && isStatsDialogOpen,
  });

  const filteredMembers = teamMembers?.filter((member: any) => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArchived = showArchived ? true : !member.archived;
    return matchesSearch && matchesArchived;
  });

  const activeCount = teamMembers?.filter((m: any) => !m.archived).length || 0;
  const archivedCount = teamMembers?.filter((m: any) => m.archived).length || 0;

  const handleArchiveToggle = async (member: any) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ archived: !member.archived })
        .eq('id', member.id);

      if (error) throw error;

      window.location.reload();
    } catch (error) {
      console.error('Error toggling archive:', error);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Gestão de Equipe
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie fotógrafos, assistentes e membros da equipe
          </p>
        </div>
        <TeamMemberDialog>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Membro
          </Button>
        </TeamMemberDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-sm text-muted-foreground">Membros Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Archive className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{archivedCount}</p>
                <p className="text-sm text-muted-foreground">Arquivados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teamMembers?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Geral</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">-</p>
                <p className="text-sm text-muted-foreground">Horas Totais</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant={showArchived ? "default" : "outline"}
              onClick={() => setShowArchived(!showArchived)}
              className="gap-2"
            >
              <Archive className="h-4 w-4" />
              {showArchived ? "Esconder Arquivados" : "Mostrar Arquivados"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Carregando membros...</p>
          </CardContent>
        </Card>
      ) : !filteredMembers || filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">
              {searchTerm ? "Nenhum membro encontrado" : "Nenhum membro cadastrado"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm 
                ? "Tente buscar com outros termos" 
                : "Comece adicionando membros da sua equipe"}
            </p>
            {!searchTerm && (
              <TeamMemberDialog>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Membro
                </Button>
              </TeamMemberDialog>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member: any) => (
            <Card key={member.id} className={member.archived ? "opacity-60" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{member.name}</h3>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {member.type || "Membro"}
                    </Badge>
                  </div>
                  {member.archived && (
                    <Badge variant="outline" className="text-xs">
                      Arquivado
                    </Badge>
                  )}
                </div>

                {member.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}

                {member.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Phone className="h-4 w-4" />
                    <span>{member.phone}</span>
                  </div>
                )}

                {member.notes && (
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                    {member.notes}
                  </p>
                )}

                <div className="text-xs text-muted-foreground mb-4">
                  Criado {formatDistanceToNow(new Date(member.created_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => {
                      setSelectedMember(member);
                      setIsStatsDialogOpen(true);
                    }}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Estatísticas</span>
                  </Button>
                  
                  <TeamMemberDialog member={member}>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                  </TeamMemberDialog>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleArchiveToggle(member)}
                  >
                    {member.archived ? (
                      <ArchiveRestore className="h-4 w-4" />
                    ) : (
                      <Archive className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Statistics Dialog */}
      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5" />
              Estatísticas - {selectedMember?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {memberStats?.totalProjects || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total Projetos
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {memberStats?.activeProjects || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ativos
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {memberStats?.completedProjects || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Concluídos
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {memberStats?.totalHours?.toFixed(1) || 0}h
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total Horas
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Projects History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Histórico de Projetos</CardTitle>
              </CardHeader>
              <CardContent>
                {memberStats?.projects && memberStats.projects.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {memberStats.projects.map((project: any) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{project.title}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {project.type}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {project.status}
                            </Badge>
                          </div>
                        </div>
                        {project.time_spent && (
                          <div className="text-sm text-muted-foreground ml-3">
                            {Number(project.time_spent).toFixed(1)}h
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum projeto atribuído ainda
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
