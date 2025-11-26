import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  locale: string;
  name: string;
}

const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  // Moedas Africanas
  AOA: { code: 'AOA', symbol: 'Kz', locale: 'pt-AO', name: 'Kwanza Angolano' },
  ZAR: { code: 'ZAR', symbol: 'R', locale: 'en-ZA', name: 'Rand Sul-Africano' },
  MZN: { code: 'MZN', symbol: 'MT', locale: 'pt-MZ', name: 'Metical Moçambicano' },
  NGN: { code: 'NGN', symbol: '₦', locale: 'en-NG', name: 'Naira Nigeriana' },
  KES: { code: 'KES', symbol: 'KSh', locale: 'en-KE', name: 'Xelim Queniano' },
  GHS: { code: 'GHS', symbol: '₵', locale: 'en-GH', name: 'Cedi Ganês' },
  EGP: { code: 'EGP', symbol: 'E£', locale: 'ar-EG', name: 'Libra Egípcia' },
  MAD: { code: 'MAD', symbol: 'د.م.', locale: 'ar-MA', name: 'Dirham Marroquino' },
  XOF: { code: 'XOF', symbol: 'CFA', locale: 'fr-SN', name: 'Franco CFA (África Ocidental)' },
  XAF: { code: 'XAF', symbol: 'FCFA', locale: 'fr-CM', name: 'Franco CFA (África Central)' },
  TZS: { code: 'TZS', symbol: 'TSh', locale: 'en-TZ', name: 'Xelim Tanzaniano' },
  UGX: { code: 'UGX', symbol: 'USh', locale: 'en-UG', name: 'Xelim Ugandense' },
  ZMW: { code: 'ZMW', symbol: 'ZK', locale: 'en-ZM', name: 'Kwacha Zambiano' },
  BWP: { code: 'BWP', symbol: 'P', locale: 'en-BW', name: 'Pula Botsuano' },
  
  // Moedas Principais Mundiais
  USD: { code: 'USD', symbol: '$', locale: 'en-US', name: 'Dólar Americano' },
  EUR: { code: 'EUR', symbol: '€', locale: 'pt-PT', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', name: 'Libra Esterlina' },
  BRL: { code: 'BRL', symbol: 'R$', locale: 'pt-BR', name: 'Real Brasileiro' },
  JPY: { code: 'JPY', symbol: '¥', locale: 'ja-JP', name: 'Iene Japonês' },
  CNY: { code: 'CNY', symbol: '¥', locale: 'zh-CN', name: 'Yuan Chinês' },
  CHF: { code: 'CHF', symbol: 'CHF', locale: 'de-CH', name: 'Franco Suíço' },
  CAD: { code: 'CAD', symbol: 'C$', locale: 'en-CA', name: 'Dólar Canadense' },
  AUD: { code: 'AUD', symbol: 'A$', locale: 'en-AU', name: 'Dólar Australiano' },
};

export function useCurrency() {
  const { user } = useAuth();

  const { data: preferences } = useQuery({
    queryKey: ['user_preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('currency, custom_currencies')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const currencyCode = preferences?.currency || 'AOA';
  
  // Merge built-in currencies with custom currencies
  const customCurrencies = (preferences?.custom_currencies as unknown as CurrencyInfo[]) || [];
  const allCurrencies = { ...CURRENCY_MAP };
  customCurrencies.forEach(currency => {
    allCurrencies[currency.code] = currency;
  });
  
  const currencyInfo = allCurrencies[currencyCode] || CURRENCY_MAP.AOA;

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
    allCurrencies,
    builtInCurrencies: CURRENCY_MAP,
    customCurrencies,
  };
}
