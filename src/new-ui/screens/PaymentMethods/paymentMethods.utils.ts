import type { PaymentMethodItem } from 'query/hooks/usePaymentMethods';

export const PAYMENT_METHODS_EMPTY_MESSAGE =
  'No debit cards linked yet. Your cards will be displayed here once added.';

export function filterDebitCards(items: PaymentMethodItem[] | undefined): PaymentMethodItem[] {
  return (items ?? []).filter(
    (item) => (item.card_type ?? '').toUpperCase() === 'DEBIT'
  );
}

export function formatCardLabel(item: PaymentMethodItem): string {
  const provider = (item.card_provider || 'Card').toUpperCase();
  const last4 = item.card_last4 || '••••';
  return `${provider}  •••• ${last4}`;
}

export function formatExpiry(item: PaymentMethodItem): string | null {
  const month = String(item.exp_month ?? '').padStart(2, '0');
  const yearRaw = String(item.exp_year ?? '');
  if (!month || month === '00' || !yearRaw) return null;
  const year = yearRaw.length >= 2 ? yearRaw.slice(-2) : yearRaw;
  return `${month}/${year}`;
}
