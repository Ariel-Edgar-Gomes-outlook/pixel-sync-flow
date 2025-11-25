import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um valor monetário de acordo com a moeda especificada
 * @param amount - Valor a ser formatado
 * @param currency - Código da moeda (AOA, EUR, USD, BRL)
 * @param locale - Locale para formatação (padrão: pt-AO)
 */
export function formatCurrency(
  amount: number | null | undefined, 
  currency: string = 'AOA',
  locale: string = 'pt-AO'
): string {
  if (amount === null || amount === undefined) return '-';

  const currencySymbols: Record<string, string> = {
    AOA: 'Kz',
    EUR: '€',
    USD: '$',
    BRL: 'R$',
  };

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback para formato manual se Intl falhar
    const symbol = currencySymbols[currency] || currency;
    return `${symbol} ${amount.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}
