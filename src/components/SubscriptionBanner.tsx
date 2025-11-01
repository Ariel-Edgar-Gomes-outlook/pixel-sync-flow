import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export function SubscriptionBanner() {
  const { data: subscription } = useSubscription();

  if (!subscription || subscription.isActive) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="ml-2">
        <strong>Período de teste expirado.</strong> Você está em modo de visualização. 
        Entre em contato para continuar usando todas as funcionalidades.
      </AlertDescription>
    </Alert>
  );
}

export function SubscriptionWarning() {
  const { data: subscription } = useSubscription();

  if (!subscription || subscription.isActive === false || subscription.daysRemaining > 1) {
    return null;
  }

  return (
    <Alert className="mb-4 border-orange-500 bg-orange-50 text-orange-900 dark:bg-orange-950 dark:text-orange-100">
      <Clock className="h-4 w-4" />
      <AlertDescription className="ml-2">
        <strong>Atenção!</strong> Seu período de teste termina em {subscription.daysRemaining} dia{subscription.daysRemaining !== 1 ? 's' : ''}.
      </AlertDescription>
    </Alert>
  );
}
