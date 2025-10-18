import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, User, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AuditLog {
  id: string;
  user_id: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  previous_data: any;
  new_data: any;
  created_at: string;
  profiles?: {
    name: string;
    email: string;
  };
}

const actionColors = {
  INSERT: "success",
  UPDATE: "warning",
  DELETE: "destructive",
} as const;

const actionLabels = {
  INSERT: "Criado",
  UPDATE: "Atualizado",
  DELETE: "Eliminado",
};

export function AuditLogViewer() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          profiles:user_id (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as AuditLog[];
    },
  });

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Registo de Auditoria</h2>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-3">
          {logs && logs.length > 0 ? (
            logs.map((log) => (
              <Card key={log.id} className="p-4 bg-muted/30">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={actionColors[log.action as keyof typeof actionColors] || 'secondary'}>
                      {actionLabels[log.action as keyof typeof actionLabels] || log.action}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">
                      {log.entity_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(log.created_at).toLocaleString('pt-PT')}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <User className="h-3 w-3" />
                  <span>{log.profiles?.name || log.profiles?.email || 'Sistema'}</span>
                </div>

                {log.action === 'UPDATE' && log.new_data && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Alterações:</p>
                    <div className="space-y-1">
                      {Object.entries(log.new_data).map(([key, value]) => {
                        const oldValue = log.previous_data?.[key];
                        if (oldValue === value) return null;
                        
                        return (
                          <div key={key} className="text-xs">
                            <span className="font-medium">{key}:</span>{' '}
                            <span className="text-destructive line-through">{JSON.stringify(oldValue)}</span>
                            {' → '}
                            <span className="text-success">{JSON.stringify(value)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {log.action === 'INSERT' && log.new_data && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Dados criados:</p>
                    <pre className="text-xs text-foreground bg-background p-2 rounded overflow-x-auto">
                      {JSON.stringify(log.new_data, null, 2)}
                    </pre>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum registo de auditoria disponível</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}