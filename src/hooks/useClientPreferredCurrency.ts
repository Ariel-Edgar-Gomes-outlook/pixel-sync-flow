import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CurrencyFrequency {
  currency: string;
  count: number;
}

export function useClientPreferredCurrency(clientId: string | null | undefined) {
  return useQuery({
    queryKey: ['client-preferred-currency', clientId],
    queryFn: async () => {
      if (!clientId) return null;

      const currencyMap: Record<string, number> = {};

      // Buscar orçamentos do cliente
      const { data: quotes } = await supabase
        .from('quotes')
        .select('currency')
        .eq('client_id', clientId)
        .not('currency', 'is', null);

      quotes?.forEach(quote => {
        if (quote.currency) {
          currencyMap[quote.currency] = (currencyMap[quote.currency] || 0) + 1;
        }
      });

      // Buscar faturas do cliente
      const { data: invoices } = await supabase
        .from('invoices')
        .select('currency')
        .eq('client_id', clientId)
        .not('currency', 'is', null);

      invoices?.forEach(invoice => {
        if (invoice.currency) {
          currencyMap[invoice.currency] = (currencyMap[invoice.currency] || 0) + 1;
        }
      });

      // Buscar pagamentos do cliente
      const { data: payments } = await supabase
        .from('payments')
        .select('currency')
        .eq('client_id', clientId)
        .not('currency', 'is', null);

      payments?.forEach(payment => {
        if (payment.currency) {
          currencyMap[payment.currency] = (currencyMap[payment.currency] || 0) + 1;
        }
      });

      // Encontrar a moeda mais utilizada
      let mostUsedCurrency: string | null = null;
      let maxCount = 0;

      Object.entries(currencyMap).forEach(([currency, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostUsedCurrency = currency;
        }
      });

      return {
        preferredCurrency: mostUsedCurrency,
        currencyFrequency: Object.entries(currencyMap).map(([currency, count]) => ({
          currency,
          count,
        })) as CurrencyFrequency[],
        totalTransactions: Object.values(currencyMap).reduce((sum, count) => sum + count, 0),
      };
    },
    enabled: !!clientId,
  });
}
