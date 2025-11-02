import { useSubscription } from './useSubscription';
import { toast } from 'sonner';

export function useSubscriptionGuard() {
  const { data: subscription } = useSubscription();

  const checkAccess = (action: string = 'realizar esta ação'): boolean => {
    if (subscription?.isExpired) {
      toast.error('Período de teste expirado', {
        description: `Você não pode ${action} no modo de visualização. Entre em contato para renovar.`,
      });
      return false;
    }
    return true;
  };

  return {
    canCreate: () => checkAccess('criar novos registros'),
    canUpdate: () => checkAccess('editar registros'),
    canDelete: () => checkAccess('excluir registros'),
    checkAccess,
    isReadOnly: subscription?.isExpired ?? false,
    subscription,
  };
}
