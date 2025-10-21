import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Check, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GoogleCalendarIntegrationProps {
  userId: string;
}

export function GoogleCalendarIntegration({ userId }: GoogleCalendarIntegrationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const queryClient = useQueryClient();

  // Check if user has Google Calendar connected
  const { data: integration, isLoading } = useQuery({
    queryKey: ['calendar_integration', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_integrations')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', 'google')
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  // Connect to Google Calendar
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { action: 'connect' }
      });

      if (error) throw error;

      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      toast.error('Erro ao conectar ao Google Calendar');
      setIsConnecting(false);
    }
  };

  // Disconnect from Google Calendar
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      if (!integration) return;

      const { error } = await supabase
        .from('calendar_integrations')
        .update({ is_active: false })
        .eq('id', integration.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar_integration'] });
      toast.success('Desconectado do Google Calendar');
    },
    onError: () => {
      toast.error('Erro ao desconectar');
    },
  });

  // Sync jobs with Google Calendar
  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { action: 'sync' }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Jobs sincronizados com o Google Calendar');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: () => {
      toast.error('Erro ao sincronizar jobs');
    },
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Integração Google Calendar</h2>
        {integration && (
          <Badge variant="default" className="gap-1 bg-green-500">
            <Check className="h-3 w-3" />
            Conectado
          </Badge>
        )}
      </div>

      {integration ? (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
              <Check className="h-4 w-4" />
              <span className="font-medium">Google Calendar conectado</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Seus jobs serão automaticamente sincronizados com o Google Calendar
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="gap-2"
            >
              {syncMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Sincronizar Agora
            </Button>

            <Button
              variant="outline"
              onClick={() => window.open('https://calendar.google.com', '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir Google Calendar
            </Button>

            <Button
              variant="destructive"
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
            >
              Desconectar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-4">
              Conecte seu Google Calendar para sincronizar automaticamente seus jobs como eventos no calendário.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <span>Sincronização automática de jobs</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <span>Lembretes e notificações do Google</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <span>Acesso em todos os seus dispositivos</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="gap-2 w-full sm:w-auto"
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Calendar className="h-4 w-4" />
            )}
            Conectar Google Calendar
          </Button>
        </div>
      )}
    </Card>
  );
}