import { Bell, BellOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useBrowserNotifications } from "@/hooks/useBrowserNotifications";
import { testNotificationSound } from "@/lib/notificationSounds";
import { useState } from "react";

export function BrowserNotificationToggle() {
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem('notificationSoundsEnabled') !== 'false'
  );
  const { isSupported, permission, requestPermission } = useBrowserNotifications(soundEnabled);

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('notificationSoundsEnabled', String(enabled));
    
    // Test sound when enabling
    if (enabled) {
      testNotificationSound('info');
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notificações Push
          </CardTitle>
          <CardDescription>
            Seu navegador não suporta notificações push
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getStatusBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge className="bg-green-500">Ativadas</Badge>;
      case 'denied':
        return <Badge variant="destructive">Bloqueadas</Badge>;
      default:
        return <Badge variant="secondary">Não configuradas</Badge>;
    }
  };

  const getDescription = () => {
    switch (permission) {
      case 'granted':
        return 'Você receberá notificações mesmo quando não estiver na página';
      case 'denied':
        return 'Você bloqueou as notificações. Para ativar, altere as configurações do navegador';
      default:
        return 'Receba alertas importantes mesmo quando não estiver na página';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Notificações Push</CardTitle>
              <CardDescription className="mt-1">{getDescription()}</CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        {permission !== 'granted' && permission !== 'denied' && (
          <Button onClick={requestPermission} className="w-full">
            <Bell className="h-4 w-4 mr-2" />
            Ativar Notificações Push
          </Button>
        )}
        {permission === 'denied' && (
          <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
            <p className="font-semibold mb-2">Como ativar:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Clique no ícone de cadeado na barra de endereço</li>
              <li>Procure por "Notificações"</li>
              <li>Altere para "Permitir"</li>
              <li>Recarregue a página</li>
            </ol>
          </div>
        )}
        {permission === 'granted' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <Bell className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
              <p>Você receberá notificações em tempo real sobre pagamentos, jobs e muito mais!</p>
            </div>

            <Separator />

            {/* Sound Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-primary" />
                  <Label htmlFor="sound-toggle" className="cursor-pointer">
                    Sons de Notificação
                  </Label>
                </div>
                <Switch
                  id="sound-toggle"
                  checked={soundEnabled}
                  onCheckedChange={handleSoundToggle}
                />
              </div>
              <p className="text-xs text-muted-foreground pl-6">
                Reproduzir sons diferentes para cada tipo de notificação
              </p>

              {soundEnabled && (
                <div className="pl-6 space-y-2 pt-2">
                  <p className="text-xs font-medium text-foreground">Tipos de sons:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testNotificationSound('urgent')}
                      className="text-xs"
                    >
                      🚨 Urgente
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testNotificationSound('important')}
                      className="text-xs"
                    >
                      ⚠️ Importante
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testNotificationSound('info')}
                      className="text-xs"
                    >
                      ℹ️ Info
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testNotificationSound('success')}
                      className="text-xs"
                    >
                      ✅ Sucesso
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
