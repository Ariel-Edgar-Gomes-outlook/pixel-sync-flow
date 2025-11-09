import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, AlertCircle } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function PushNotificationToggle() {
  const { isSupported, permission, isEnabled, requestPermission, showNotification } = usePushNotifications();

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      const granted = await requestPermission();
      
      // Mostrar notificação de teste se permitido
      if (granted) {
        await showNotification({
          title: '🔔 Notificações Ativadas!',
          body: 'Você receberá notificações importantes do sistema',
          tag: 'welcome',
        });
      }
    } else {
      // Não podemos desativar programaticamente - usuário deve fazer isso no browser
      alert('Para desativar notificações, vá nas configurações do seu navegador.');
    }
  };

  const handleTestNotification = async () => {
    await showNotification({
      title: '🧪 Notificação de Teste',
      body: 'Esta é uma notificação de teste do sistema!',
      tag: 'test',
      data: { test: true },
    });
  };

  if (!isSupported) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Seu navegador não suporta notificações push. Tente usar Chrome, Firefox, Edge ou Safari.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="flex items-start gap-3">
          {isEnabled ? (
            <Bell className="h-5 w-5 text-primary mt-0.5" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground mt-0.5" />
          )}
          <div className="flex-1">
            <Label htmlFor="push-notifications" className="text-base font-medium cursor-pointer">
              Notificações Push do Navegador
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Receba notificações no sistema mesmo quando o navegador estiver minimizado
            </p>
          </div>
        </div>
        <Switch
          id="push-notifications"
          checked={isEnabled}
          onCheckedChange={handleToggle}
        />
      </div>

      {permission === 'denied' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs sm:text-sm">
            <strong>Permissão negada.</strong> Para ativar notificações, você precisa alterar as configurações 
            do seu navegador. Procure por "Configurações do Site" ou "Permissões" nas configurações do navegador.
          </AlertDescription>
        </Alert>
      )}

      {isEnabled && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestNotification}
            className="text-xs sm:text-sm"
          >
            Enviar Notificação de Teste
          </Button>
        </div>
      )}

      {permission === 'default' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs sm:text-sm">
            Ative o toggle acima para começar a receber notificações do sistema operativo.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
