import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GoogleCalendarIntegrationProps {
  userId: string;
}

export function GoogleCalendarIntegration({ userId }: GoogleCalendarIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      
      // Call edge function to get OAuth URL
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { action: 'connect' }
      });

      if (error) throw error;

      if (data?.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      }
    } catch (error: any) {
      toast({
        title: "Erro ao conectar",
        description: error.message || "Não foi possível conectar ao Google Calendar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { action: 'disconnect' }
      });

      if (error) throw error;

      setIsConnected(false);
      toast({
        title: "Desconectado",
        description: "Google Calendar desconectado com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao desconectar",
        description: error.message || "Não foi possível desconectar do Google Calendar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncNow = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { action: 'sync' }
      });

      if (error) throw error;

      toast({
        title: "Sincronizado",
        description: "Jobs sincronizados com Google Calendar",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao sincronizar",
        description: error.message || "Não foi possível sincronizar com Google Calendar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Google Calendar</CardTitle>
            <CardDescription>
              Sincronize seus jobs automaticamente com o Google Calendar
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <XCircle className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">
                {isConnected ? "Conectado" : "Não conectado"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isConnected
                  ? "Jobs estão sendo sincronizados automaticamente"
                  : "Conecte sua conta Google para sincronizar"}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isConnected ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleSyncNow}
                  disabled={isLoading}
                >
                  Sincronizar Agora
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                  disabled={isLoading}
                >
                  Desconectar
                </Button>
              </>
            ) : (
              <Button onClick={handleConnect} disabled={isLoading}>
                Conectar Google Calendar
              </Button>
            )}
          </div>
        </div>

        {isConnected && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">Configurações de Sincronização</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Novos jobs são adicionados automaticamente</li>
              <li>• Atualizações de jobs são sincronizadas</li>
              <li>• Jobs excluídos são removidos do calendário</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
