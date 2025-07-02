/**
 * Currency conversion utilities for LT to EUR
 * Exchange rate: 1 LT = 0.286 EUR (approximately 3.5 LT = 1 EUR)
 */

export const EXCHANGE_RATE = {
  LT_TO_EUR: 0.286,
  EUR_TO_LT: 3.5
};

/**
 * Convert LT to EUR
 */
export function ltToEur(amountLT: number): number {
  return Number((amountLT * EXCHANGE_RATE.LT_TO_EUR).toFixed(2));
}

/**
 * Convert EUR to LT
 */
export function eurToLt(amountEUR: number): number {
  return Number((amountEUR * EXCHANGE_RATE.EUR_TO_LT).toFixed(2));
}

/**
 * Format currency with symbol
 */
export function formatCurrency(amount: number, currency: 'LT' | 'EUR'): string {
  const formatted = new Intl.NumberFormat('lt-LT', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return `${formatted} ${currency}`;
}

/**
 * Format amount with both currencies
 */
export function formatDualCurrency(amountLT: number): string {
  const eurAmount = ltToEur(amountLT);
  return `${formatCurrency(amountLT, 'LT')} (≈${formatCurrency(eurAmount, 'EUR')})`;
}

/**
 * Get current exchange rate display
 */
export function getExchangeRateDisplay(): string {
  return `1 LT ≈ ${EXCHANGE_RATE.LT_TO_EUR} EUR`;
}