// packages/api/modules/revenue/services/currency-service.ts
import { Decimal } from '@ecom/db';
import { redis } from '@ecom/shared';

/**
 * Currency Service
 * Handles exchange rate management and read-time conversion.
 * Base currency is NGN (Naira).
 */
export const currencyService = {
  // Hardcoded initial rates for West African markets
  // In production, these would be updated daily from an FX API (e.g. fixer.io, currencyapi)
  async getRates(): Promise<Record<string, number>> {
    const cached = await redis.get('fx:rates');
    if (cached) return JSON.parse(cached);

    const rates = {
      NGN: 1,
      GHS: 0.015, // 1 NGN = 0.015 GHS (Sample)
      KES: 0.13,  // 1 NGN = 0.13 KES (Sample)
      USD: 0.00065 // 1 NGN = 0.00065 USD (Sample)
    };

    await redis.set('fx:rates', JSON.stringify(rates), 'EX', 3600); // Cache for 1 hour
    return rates;
  },

  async convert(amount: Decimal | number, from: string, to: string): Promise<Decimal> {
    const decAmount = new Decimal(amount);
    if (from === to) return decAmount;

    const rates = await this.getRates();
    const fromRate = rates[from];
    const toRate = rates[to];

    if (!fromRate || !toRate) {
      console.warn(`[CurrencyService] Missing rate for ${from} or ${to}. Returning original amount.`);
      return decAmount;
    }

    // Convert to NGN (base) then to target
    const amountInBase = decAmount.div(fromRate);
    const converted = amountInBase.mul(toRate);

    return converted.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  },

  async format(amount: Decimal | number, currency: string): Promise<string> {
    const decAmount = new Decimal(amount);
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    });
    return formatter.format(decAmount.toNumber());
  }
};
