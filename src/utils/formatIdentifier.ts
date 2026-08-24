/**
 * Display rules for the long opaque strings on receipts / transaction details.
 *
 * Two different kinds of value, two different rules:
 *
 * - **Identifiers** (transaction id, trade id, reference) are quoted verbatim to support
 *   and pasted into lookups, so they are shown IN FULL and allowed to wrap. Tail-clipping
 *   them ("14081675284386…") makes the row useless — the digits that distinguish two
 *   transactions are the ones that get cut.
 * - **Wallet addresses / hashes** are recognized by their ends, never read in the middle,
 *   so they elide from the MIDDLE and always keep the last characters visible.
 */

/**
 * Keep the head and tail of a long value, elide the middle:
 * `0x15Aea9277…f3c8807a`. Values short enough to fit are returned untouched.
 */
export function shortenMiddle(
  value: string | null | undefined,
  head = 10,
  tail = 6
): string {
  const v = String(value ?? "").trim();
  // Nothing gained by eliding when the ellipsis costs as much as it saves.
  if (v.length <= head + tail + 3) return v;
  return `${v.slice(0, head)}...${v.slice(-tail)}`;
}

/** Wallet-address flavour of {@link shortenMiddle} — same rule, named at the call site. */
export function shortenWalletAddress(
  value: string | null | undefined,
  head = 10,
  tail = 6
): string {
  return shortenMiddle(value, head, tail);
}
