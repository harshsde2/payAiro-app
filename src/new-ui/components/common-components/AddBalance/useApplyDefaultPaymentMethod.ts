import { useEffect, useRef } from 'react';
import type { PaymentMethodItem } from 'query/hooks/usePaymentMethods';
import { getCardEligibility, type PaymentFlow } from './PaymentMethodPickerModal';
import { getDefaultPaymentMethodId } from './defaultPaymentMethod';

type Args = {
  items: PaymentMethodItem[];
  flow: PaymentFlow;
  selected: PaymentMethodItem | null;
  onSelect: (item: PaymentMethodItem) => void;
  /** Skip pre-selection entirely (e.g. plain P2P send has no card). Default true. */
  enabled?: boolean;
};

/**
 * Auto-selects the user's default card (if set + eligible for this flow) the first time
 * the card list loads and nothing is selected yet. Fires ONCE per mount (guarded by a ref),
 * so it never overrides a manual selection or the post-add-card selection.
 */
export function useApplyDefaultPaymentMethod({
  items,
  flow,
  selected,
  onSelect,
  enabled = true,
}: Args): void {
  const appliedRef = useRef(false);

  useEffect(() => {
    if (appliedRef.current) return;
    if (!enabled) return;
    if (!items || items.length === 0) return;

    // First non-empty load — attempt exactly once, whether or not a default exists.
    appliedRef.current = true;

    if (selected) return;
    const defaultId = getDefaultPaymentMethodId();
    if (!defaultId) return;
    const card = items.find((i) => i.payment_method_id === defaultId);
    if (!card) return;
    if (!getCardEligibility(card, flow).ok) return;
    onSelect(card);
  }, [items, flow, selected, onSelect, enabled]);
}
