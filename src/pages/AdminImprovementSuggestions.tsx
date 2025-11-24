import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Calendar, Check, Clock, X, ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Suggestion {
  id: string;
  user_id: string;
  system_area: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const systemAreaLabels: Record<string, string> = {
  dashboard: "Dashboard / Página Inicial",
  clients: "Gestão de Clientes",
  jobs: "Gestão de Trabalhos",
  calendar: "Agenda / Calendário",
  leads: "Potenciais Clientes",
  quotes: "Orçamentos",
  invoices: "Faturas",
  contracts: "Contratos",
  payments: "Financeiro / Pagamentos",
  galleries: "Galerias de Clientes",
  reports: "Relatórios",
  resources: "Recursos / Equipamentos",
  team: "Gestão de Equipe",
  notifications: "Notificações",
  settings: "Configurações",
  other: "Outra Área",
};

const priorityColors: Record<string, string> = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

const priorityLabels: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  completed: "bg-green-500/10 text-green-700 border-green-500/20",
  rejected: "bg-red-500/10 text-red-700 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  in_progress: "Em Análise",
  completed: "Concluída",
  rejected: "Rejeitada",
};

export default function AdminImprovementSuggestions() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["admin-improvement-suggestions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("improvement_suggestions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Suggestion[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("improvement_suggestions")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-improvement-suggestions"] });
      toast.success("Status atualizado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    },
  });

  const deleteSuggestion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("improvement_suggestions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-improvement-suggestions"] });
      toast.success("Sugestão removida com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao remover sugestão:", error);
      toast.error("Erro ao remover sugestão");
    },
  });

  const filteredSuggestions = suggestions?.filter((suggestion) => {
    if (filterStatus !== "all" && suggestion.status !== filterStatus) return false;
    if (filterPriority !== "all" && suggestion.priority !== filterPriority) return false;
    return true;
  });

  const stats = {
    total: suggestions?.length || 0,
    pending: suggestions?.filter((s) => s.status === "pending").length || 0,
    inProgress: suggestions?.filter((s) => s.status === "in_progress").length || 0,
    completed: suggestions?.filter((s) => s.status === "completed").length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Carregando sugestões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/subscribers">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Assinantes
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Lightbulb className="w-8 h-8 text-primary" />
            </div>
            Sugestões de Melhorias
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie todas as sugestões enviadas pelos usuários
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-card to-primary/5">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-card to-yellow-500/5">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Pendentes</p>
            <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-card to-blue-500/5">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Em Análise</p>
            <p className="text-3xl font-bold text-blue-700">{stats.inProgress}</p>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-card to-green-500/5">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Concluídas</p>
            <p className="text-3xl font-bold text-green-700">{stats.completed}</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Filtrar por Status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="in_progress">Em Análise</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="rejected">Rejeitada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Filtrar por Prioridade</label>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Suggestions List */}
      <div className="space-y-4">
        {filteredSuggestions && filteredSuggestions.length > 0 ? (
          filteredSuggestions.map((suggestion) => (
            <Card key={suggestion.id} className="p-6 hover:shadow-lg transition-all">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {systemAreaLabels[suggestion.system_area] || suggestion.system_area}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${priorityColors[suggestion.priority]}`} />
                        <span className="text-xs text-muted-foreground">
                          {priorityLabels[suggestion.priority]}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold">{suggestion.title}</h3>
                  </div>
                  <Badge className={`${statusColors[suggestion.status]} border`}>
                    {statusLabels[suggestion.status]}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {suggestion.description}
                </p>

                {/* Footer */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(suggestion.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus.mutate({ id: suggestion.id, status: "in_progress" })}
                      disabled={suggestion.status === "in_progress"}
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Em Análise
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-700 hover:bg-green-50"
                      onClick={() => updateStatus.mutate({ id: suggestion.id, status: "completed" })}
                      disabled={suggestion.status === "completed"}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Concluir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-700 hover:bg-red-50"
                      onClick={() => updateStatus.mutate({ id: suggestion.id, status: "rejected" })}
                      disabled={suggestion.status === "rejected"}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rejeitar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja remover esta sugestão?")) {
                          deleteSuggestion.mutate(suggestion.id);
                        }
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <Lightbulb className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              {filterStatus !== "all" || filterPriority !== "all"
                ? "Nenhuma sugestão encontrada com os filtros selecionados"
                : "Nenhuma sugestão recebida ainda"}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
