import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserPlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface TeamManagementProps {
  jobId: string;
}

export function TeamManagement({ jobId }: TeamManagementProps) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const queryClient = useQueryClient();

  // Fetch only team members (NOT clients)
  // Filter by type: photographer, assistant, editor, admin
  const { data: allUsers } = useQuery({
    queryKey: ['team_profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('type', 'client')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch team members for this job
  const { data: teamMembers } = useQuery({
    queryKey: ['job_team_members', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_team_members')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            email
          )
        `)
        .eq('job_id', jobId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });

  const addMember = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data, error } = await supabase
        .from('job_team_members')
        .insert({
          job_id: jobId,
          user_id: userId,
          role: role,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_team_members', jobId] });
      toast.success("Membro adicionado!");
      setSelectedUserId("");
      setSelectedRole("");
    },
    onError: () => {
      toast.error("Erro ao adicionar membro");
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
      toast.error("Selecione um usuário e função");
      return;
    }

    addMember.mutate({ userId: selectedUserId, role: selectedRole });
  };

  const availableUsers = allUsers?.filter(
    user => !teamMembers?.some(member => member.user_id === user.user_id)
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Equipa do Projeto
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Adicione fotógrafos, assistentes e outros membros da sua equipe (não clientes)
        </p>
      </div>

      {/* Add Member Form */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar fotógrafo/equipe" />
            </SelectTrigger>
            <SelectContent>
              {availableUsers && availableUsers.length > 0 ? (
                availableUsers.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground">
                  Nenhum usuário disponível. Certifique-se que há perfis cadastrados no sistema.
                </div>
              )}
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
            Adicionar
          </Button>
        </div>
      </Card>

      {/* Team Members List */}
      <div className="space-y-2">
        {teamMembers && teamMembers.length > 0 ? (
          teamMembers.map((member: any) => (
            <Card key={member.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {member.profiles?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{member.profiles?.name || 'Usuário'}</p>
                    <p className="text-xs text-muted-foreground">{member.profiles?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{member.role || 'Membro'}</Badge>
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
              Nenhum membro da equipa atribuído
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}