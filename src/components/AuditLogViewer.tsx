import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, User, Clock, Users, Briefcase, FileText, 
  DollarSign, Calendar, CheckCircle, UserPlus, Package,
  FileCheck, Shield, Bell, Settings, Trash2, Edit, Plus
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface AuditLog {
  id: string;
  user_id: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  previous_data: any;
  new_data: any;
  created_at: string;
}

const actionColors = {
  INSERT: "default",
  UPDATE: "secondary",
  DELETE: "destructive",
} as const;

const actionLabels = {
  INSERT: "Criado",
  UPDATE: "Atualizado",
  DELETE: "Eliminado",
};

const actionIcons = {
  INSERT: Plus,
  UPDATE: Edit,
  DELETE: Trash2,
};

const entityLabels: Record<string, string> = {
  clients: "Cliente",
  jobs: "Job",
  quotes: "Orçamento",
  invoices: "Fatura",
  payments: "Pagamento",
  leads: "Lead",
  contracts: "Contrato",
  team_members: "Membro da Equipe",
  resources: "Recurso",
  notifications: "Notificação",
  user_preferences: "Preferências",
  business_settings: "Configurações da Empresa",
};

const entityIcons: Record<string, any> = {
  clients: Users,
  jobs: Briefcase,
  quotes: FileText,
  invoices: FileCheck,
  payments: DollarSign,
  leads: UserPlus,
  contracts: FileCheck,
  team_members: User,
  resources: Package,
  notifications: Bell,
  user_preferences: Settings,
  business_settings: Shield,
};

const fieldLabels: Record<string, string> = {
  name: "Nome",
  email: "Email",
  phone: "Telefone",
  status: "Status",
  total: "Total",
  amount: "Valor",
  date: "Data",
  description: "Descrição",
  title: "Título",
  type: "Tipo",
  priority: "Prioridade",
  budget: "Orçamento",
  start_datetime: "Data de Início",
  end_datetime: "Data de Fim",
  client_name: "Nome do Cliente",
  company: "Empresa",
  currency: "Moeda",
  paid_date: "Data de Pagamento",
};

const formatValue = (key: string, value: any): string => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (key.includes("date") || key.includes("_at")) {
    try {
      return new Date(value).toLocaleDateString('pt-PT', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return String(value);
    }
  }
  if (typeof value === "number" && (key.includes("total") || key.includes("amount") || key.includes("price"))) {
    return new Intl.NumberFormat('pt-PT', { 
      style: 'currency', 
      currency: 'AOA' 
    }).format(value);
  }
  if (typeof value === "object") return "-";
  return String(value);
};

const shouldShowField = (key: string): boolean => {
  const excludeFields = [
    'id', 'user_id', 'created_at', 'updated_at', 
    'created_by', 'metadata', 'deleted_at'
  ];
  return !excludeFields.includes(key);
};

export function AuditLogViewer() {
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterEntity, setFilterEntity] = useState<string>("all");

  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as AuditLog[];
    },
  });

  const filteredLogs = logs?.filter(log => {
    if (filterAction !== "all" && log.action !== filterAction) return false;
    if (filterEntity !== "all" && log.entity_type !== filterEntity) return false;
    return true;
  });

  const uniqueEntities = [...new Set(logs?.map(l => l.entity_type) || [])];

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando...</div>;
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <Activity className="h-5 w-5 text-primary" />
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">Histórico de Atividades</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Veja todas as alterações realizadas no sistema
      </p>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as ações</SelectItem>
            <SelectItem value="INSERT">✨ Criado</SelectItem>
            <SelectItem value="UPDATE">✏️ Atualizado</SelectItem>
            <SelectItem value="DELETE">🗑️ Eliminado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterEntity} onValueChange={setFilterEntity}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {uniqueEntities.map(entity => (
              <SelectItem key={entity} value={entity}>
                {entityLabels[entity] || entity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-3">
          {filteredLogs && filteredLogs.length > 0 ? (
            filteredLogs.map((log) => {
              const EntityIcon = entityIcons[log.entity_type] || Activity;
              const ActionIcon = actionIcons[log.action as keyof typeof actionIcons] || Activity;
              const entityLabel = entityLabels[log.entity_type] || log.entity_type;
              
              return (
                <Card key={log.id} className="p-3 sm:p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <EntityIcon className="h-4 w-4 text-primary" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge 
                          variant={actionColors[log.action as keyof typeof actionColors] || 'secondary'}
                          className="gap-1"
                        >
                          <ActionIcon className="h-3 w-3" />
                          {actionLabels[log.action as keyof typeof actionLabels] || log.action}
                        </Badge>
                        <span className="text-sm font-medium text-foreground">
                          {entityLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Clock className="h-3 w-3" />
                        {new Date(log.created_at).toLocaleDateString('pt-PT', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>

                      {log.action === 'UPDATE' && log.new_data && (
                        <div className="mt-2 space-y-1.5">
                          {Object.entries(log.new_data)
                            .filter(([key]) => shouldShowField(key))
                            .map(([key, value]) => {
                              const oldValue = log.previous_data?.[key];
                              if (oldValue === value) return null;
                              
                              const label = fieldLabels[key] || key;
                              
                              return (
                                <div key={key} className="text-xs bg-muted/50 p-2 rounded">
                                  <span className="font-medium text-foreground">{label}:</span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-muted-foreground line-through">
                                      {formatValue(key, oldValue)}
                                    </span>
                                    <span className="text-muted-foreground">→</span>
                                    <span className="text-primary font-medium">
                                      {formatValue(key, value)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                            .filter(Boolean)}
                        </div>
                      )}

                      {log.action === 'INSERT' && log.new_data && (
                        <div className="mt-2 space-y-1">
                          {Object.entries(log.new_data)
                            .filter(([key]) => shouldShowField(key))
                            .slice(0, 3)
                            .map(([key, value]) => {
                              const label = fieldLabels[key] || key;
                              return (
                                <div key={key} className="text-xs">
                                  <span className="font-medium text-muted-foreground">{label}:</span>{' '}
                                  <span className="text-foreground">{formatValue(key, value)}</span>
                                </div>
                              );
                            })}
                        </div>
                      )}

                      {log.action === 'DELETE' && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Registo removido do sistema
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Nenhuma atividade encontrada</p>
              <p className="text-xs mt-1">
                {filterAction !== "all" || filterEntity !== "all" 
                  ? "Tente ajustar os filtros acima"
                  : "As atividades aparecerão aqui quando fizer alterações no sistema"
                }
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}