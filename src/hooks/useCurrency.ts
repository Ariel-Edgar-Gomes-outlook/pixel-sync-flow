import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  locale: string;
}

const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  AOA: { code: 'AOA', symbol: 'Kz', locale: 'pt-AO' },
  EUR: { code: 'EUR', symbol: '€', locale: 'pt-PT' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US' },
  BRL: { code: 'BRL', symbol: 'R$', locale: 'pt-BR' },
};

export function useCurrency() {
  const { user } = useAuth();

  const { data: preferences } = useQuery({
    queryKey: ['user_preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('currency')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const currencyCode = preferences?.currency || 'AOA';
  const currencyInfo = CURRENCY_MAP[currencyCode] || CURRENCY_MAP.AOA;

  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return '-';

    try {
      return new Intl.NumberFormat(currencyInfo.locale, {
        style: 'currency',
        currency: currencyInfo.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      // Fallback para formato manual se Intl falhar
      return `${currencyInfo.symbol} ${amount.toLocaleString(currencyInfo.locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  };

  return {
    currencyCode,
    currencyInfo,
    formatCurrency,
  };
}
