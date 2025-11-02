import { createContext, useContext, ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

interface SubscriptionContextType {
  canPerformAction: () => boolean;
  isExpired: boolean;
  isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { data: subscription, isLoading } = useSubscription();

  const canPerformAction = () => {
    if (isLoading) return false;
    
    if (!subscription) return false;
    
    // Se a assinatura está expirada, bloquear ações
    if (subscription.isExpired) {
      toast.error('Período de teste expirado', {
        description: 'Você não pode realizar esta ação. Entre em contato para ativar sua assinatura.',
      });
      return false;
    }

    return true;
  };

  return (
    <SubscriptionContext.Provider 
      value={{ 
        canPerformAction, 
        isExpired: subscription?.isExpired ?? false,
        isLoading 
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  return context;
}
