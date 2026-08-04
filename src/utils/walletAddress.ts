/**
 * Shared crypto wallet-address detection for the send flows (QR scanner + NewSend).
 *
 * Deliberately permissive: staging uses TESTNET addresses (e.g. BTC bech32 `tb1…`
 * instead of `bc1…`) and PayAiro supports several chains (EVM, SOL, XRP, BTC, …), so
 * strict per-chain/mainnet-only regexes wrongly rejected valid addresses. We accept the
 * well-known shapes explicitly, plus a general base58/base32 alphanumeric fallback that
 * covers the rest, while still rejecting free text (which contains spaces/punctuation).
 */

/** Strip a URI scheme (`ethereum:0x…`, `bitcoin:…`) and any `?query` so a wrapped
 *  wallet QR still resolves to a bare address. */
export const normalizeWalletCandidate = (raw: string | null | undefined): string => {
  let v = String(raw ?? '').trim();
  const scheme = v.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:(.+)$/);
  if (scheme) v = scheme[1];
  const q = v.indexOf('?');
  if (q !== -1) v = v.slice(0, q);
  return v.trim();
};

export const isWalletAddress = (input: string | null | undefined): boolean => {
  const s = normalizeWalletCandidate(input);
  if (!s) return false;

  // Well-known shapes (kept explicit for clarity/confidence).
  if (/^0x[0-9a-fA-F]{40}$/.test(s)) return true; // Ethereum / EVM
  if (/^(bc1|tb1)[a-z0-9]{20,87}$/i.test(s)) return true; // Bitcoin bech32 (main + testnet)
  if (/^[13mn2][a-km-zA-HJ-NP-Z1-9]{25,39}$/.test(s)) return true; // BTC legacy (main 1/3, testnet m/n/2)

  // General fallback: a single alphanumeric token of address length. Covers Solana,
  // XRP (r…), Tron (T…), and other base58 chains — while rejecting sentences/free text.
  if (/^[A-Za-z0-9]{25,64}$/.test(s)) return true;

  return false;
};
