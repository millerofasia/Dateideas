export type LocalPrice = { amount: number; currency: string };
export const usdPrice: LocalPrice = { amount: 2, currency: 'USD' };

export async function getLocalPrice(signal: AbortSignal): Promise<LocalPrice> {
  const locationResponse = await fetch('https://ipapi.co/json/', { signal });
  if (!locationResponse.ok) throw new Error('Location unavailable');
  const location = await locationResponse.json();
  const currency = location.currency;
  if (location.error || typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency)) throw new Error('Currency unavailable');
  if (currency === 'USD') return usdPrice;
  const ratesResponse = await fetch('https://open.er-api.com/v6/latest/USD', { signal });
  if (!ratesResponse.ok) throw new Error('Rates unavailable');
  const rates = await ratesResponse.json();
  const rate = rates.rates?.[currency];
  if (rates.result !== 'success' || typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) throw new Error('Invalid rate');
  return { amount: 2 * rate, currency };
}

export function formatPrice(price: LocalPrice): string {
  return new Intl.NumberFormat('en', { style: 'currency', currency: price.currency, currencyDisplay: 'code' }).format(price.amount);
}
