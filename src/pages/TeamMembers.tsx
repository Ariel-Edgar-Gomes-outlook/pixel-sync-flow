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
  Phone,
  Trash2,
  Info
} from "lucide-react";
import { useTeamMembers, useUpdateTeamMember, useDeleteTeamMember } from "@/hooks/useTeamMembers";
import { TeamMemberDialog } from "@/components/TeamMemberDialog";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function TeamMembers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<any>(null);

  const { data: teamMembers, isLoading } = useTeamMembers();
  const updateMember = useUpdateTeamMember();
  const deleteMember = useDeleteTeamMember();

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
    // Se showArchived é true, mostra todos. Se false, mostra apenas não arquivados
    const matchesArchived = showArchived || !member.archived;
    return matchesSearch && matchesArchived;
  });

  const activeCount = teamMembers?.filter((m: any) => !m.archived).length || 0;
  const archivedCount = teamMembers?.filter((m: any) => m.archived).length || 0;

  const handleArchiveToggle = async (member: any) => {
    try {
      await updateMember.mutateAsync({
        id: member.id,
        archived: !member.archived
      });
      toast.success(member.archived ? "Membro restaurado!" : "Membro arquivado!");
    } catch (error) {
      console.error('Error toggling archive:', error);
      toast.error("Erro ao atualizar membro");
    }
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;
    
    try {
      await deleteMember.mutateAsync(memberToDelete.id);
      toast.success("Membro eliminado com sucesso!");
      setMemberToDelete(null);
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error("Erro ao eliminar membro");
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
              {showArchived ? "Esconder Arquivados" : `Mostrar Arquivados (${archivedCount})`}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredMembers.map((member: any) => (
            <Card key={member.id} className={member.archived ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {member.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="w-full">
                    <h3 className="font-semibold text-sm truncate mb-1">
                      {member.name}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {member.type === 'photographer' && 'Fotógrafo'}
                      {member.type === 'videographer' && 'Cinegrafista'}
                      {member.type === 'assistant' && 'Assistente'}
                      {member.type === 'editor' && 'Editor'}
                      {member.type === 'makeup_artist' && 'Maquiador(a)'}
                      {member.type === 'drone_operator' && 'Op. Drone'}
                      {member.type === 'other' && 'Outro'}
                    </Badge>
                    {member.archived && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Arquivado
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 w-full justify-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setSelectedMember(member);
                        setIsDetailsDialogOpen(true);
                      }}
                    >
                      <Info className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setSelectedMember(member);
                        setIsStatsDialogOpen(true);
                      }}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    
                    <TeamMemberDialog member={member}>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TeamMemberDialog>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleArchiveToggle(member)}
                    >
                      {member.archived ? (
                        <ArchiveRestore className="h-4 w-4" />
                      ) : (
                        <Archive className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => setMemberToDelete(member)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Info className="h-5 w-5" />
              Detalhes - {selectedMember?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                  {selectedMember?.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{selectedMember?.name}</h3>
                <Badge variant="secondary">
                  {selectedMember?.type === 'photographer' && 'Fotógrafo'}
                  {selectedMember?.type === 'videographer' && 'Cinegrafista'}
                  {selectedMember?.type === 'assistant' && 'Assistente'}
                  {selectedMember?.type === 'editor' && 'Editor'}
                  {selectedMember?.type === 'makeup_artist' && 'Maquiador(a)'}
                  {selectedMember?.type === 'drone_operator' && 'Operador de Drone'}
                  {selectedMember?.type === 'other' && 'Outro'}
                </Badge>
              </div>
            </div>

            {selectedMember?.email && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{selectedMember.email}</p>
                </div>
              </div>
            )}

            {selectedMember?.phone && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p className="text-sm font-medium">{selectedMember.phone}</p>
                </div>
              </div>
            )}

            {selectedMember?.notes && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Notas</p>
                <p className="text-sm">{selectedMember.notes}</p>
              </div>
            )}

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Criado</p>
              <p className="text-sm">
                {selectedMember?.created_at && formatDistanceToNow(new Date(selectedMember.created_at), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!memberToDelete} onOpenChange={() => setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Membro da Equipe?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar <strong>{memberToDelete?.name}</strong>?
              Esta ação não pode ser desfeita e removerá o membro de todos os projetos associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
