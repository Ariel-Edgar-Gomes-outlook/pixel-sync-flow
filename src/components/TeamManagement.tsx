import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserPlus, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TeamMemberDialog } from "./TeamMemberDialog";

interface TeamManagementProps {
  jobId: string;
}

export function TeamManagement({ jobId }: TeamManagementProps) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const queryClient = useQueryClient();

  // Fetch all team members
  const { data: allUsers } = useQuery({
    queryKey: ['team_members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch team members assigned to this job
  const { data: teamMembers } = useQuery({
    queryKey: ['job_team_members', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_team_members')
        .select(`
          *,
          team_members:team_member_id (
            id,
            name,
            email,
            type
          )
        `)
        .eq('job_id', jobId)
        .not('team_member_id', 'is', null);
      
      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });

  const addMember = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const { data, error } = await supabase
        .from('job_team_members')
        .insert({
          job_id: jobId,
          team_member_id: memberId,
          user_id: memberId, // Keep for backward compatibility
          role: role,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_team_members', jobId] });
      toast.success("Membro adicionado ao projeto!");
      setSelectedUserId("");
      setSelectedRole("");
    },
    onError: (error: any) => {
      console.error('Error adding member:', error);
      toast.error("Erro ao adicionar membro ao projeto");
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('job_team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_team_members', jobId] });
      toast.success("Membro removido!");
    },
    onError: () => {
      toast.error("Erro ao remover membro");
    },
  });

  const handleAddMember = () => {
    if (!selectedUserId || !selectedRole) {
      toast.error("Selecione um membro e função");
      return;
    }

    addMember.mutate({ memberId: selectedUserId, role: selectedRole });
  };

  const availableUsers = allUsers?.filter(
    user => !teamMembers?.some(member => member.team_member_id === user.id)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Equipa do Projeto
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Adicione fotógrafos, assistentes e outros membros da sua equipe
          </p>
        </div>
        <TeamMemberDialog />
      </div>

      {/* Alert if no team members available */}
      {(!availableUsers || availableUsers.length === 0) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Não há membros de equipe disponíveis. Crie novos membros usando o botão "Novo Membro de Equipe" acima.
          </AlertDescription>
        </Alert>
      )}

      {/* Add Member Form */}
      {availableUsers && availableUsers.length > 0 && (
        <Card className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar membro" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} - {user.type || 'Membro'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fotógrafo Principal">Fotógrafo Principal</SelectItem>
              <SelectItem value="Assistente">Assistente</SelectItem>
              <SelectItem value="Editor">Editor</SelectItem>
              <SelectItem value="Produtor">Produtor</SelectItem>
              <SelectItem value="Coordenador">Coordenador</SelectItem>
            </SelectContent>
          </Select>

            <Button 
              onClick={handleAddMember}
              disabled={addMember.isPending}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Adicionar ao Projeto
            </Button>
          </div>
        </Card>
      )}

      {/* Team Members List */}
      <div className="space-y-2">
        {teamMembers && teamMembers.length > 0 ? (
          teamMembers.map((member: any) => (
            <Card key={member.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {member.team_members?.name?.charAt(0).toUpperCase() || 'M'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{member.team_members?.name || 'Membro'}</p>
                    <p className="text-xs text-muted-foreground">{member.team_members?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {member.team_members?.type || 'Tipo'}
                  </Badge>
                  <Badge variant="secondary">{member.role || 'Função'}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMember.mutate(member.id)}
                    disabled={removeMember.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8">
            <p className="text-center text-muted-foreground text-sm">
              Nenhum membro da equipa atribuído a este projeto
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}