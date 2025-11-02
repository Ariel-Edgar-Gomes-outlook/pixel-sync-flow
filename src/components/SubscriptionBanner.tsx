import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Lock } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

export function SubscriptionBanner() {
  const { data: subscription, isLoading } = useSubscription();

  if (isLoading || !subscription) return null;

  // Não mostrar nada se a assinatura está ativa ou se é ilimitada
  if (subscription.isActive || subscription.daysRemaining === -1) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Alert variant="destructive" className="max-w-4xl mx-auto">
        <Lock className="h-5 w-5" />
        <AlertTitle className="text-lg font-semibold">
          Período de Teste Expirado
        </AlertTitle>
        <AlertDescription className="mt-2">
          Seu período de teste gratuito de 3 dias terminou. Você ainda pode visualizar seus dados, 
          mas não pode criar, editar ou excluir registros. Entre em contato para ativar sua assinatura.
        </AlertDescription>
      </Alert>
    </div>
  );
}

export function SubscriptionWarning() {
  const { data: subscription, isLoading } = useSubscription();

  if (isLoading || !subscription) return null;

  // Mostrar aviso apenas nos últimos dias do período de teste
  if (!subscription.isActive || subscription.daysRemaining === -1 || subscription.daysRemaining > 1) {
    return null;
  }

  return (
    <Alert className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Atenção: Período de Teste Terminando</AlertTitle>
      <AlertDescription>
        {subscription.daysRemaining === 0 ? (
          <span>Seu período de teste expira hoje. Em breve você terá acesso somente leitura.</span>
        ) : (
          <span>
            Falta{subscription.daysRemaining > 1 ? 'm' : ''} {subscription.daysRemaining} dia
            {subscription.daysRemaining > 1 ? 's' : ''} para o fim do seu período de teste gratuito.
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
}
