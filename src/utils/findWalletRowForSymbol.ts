import type { IWalletAddressRow } from "query/hooks/useCrypto";

export function normalizeReceiveSymbol(symbol: string): string {
  const head = symbol.split("-")[0];
  const segments = head.split("_");
  const base = segments.length > 1 ? segments[0] : head;
  return base.trim().toUpperCase();
}

export function symbolMatchCandidates(normalized: string): Set<string> {
  const s = new Set<string>([normalized]);
  if (normalized === "MATIC") s.add("POL");
  if (normalized === "POL") s.add("MATIC");
  return s;
}

export function findWalletRowForSymbol(
  rows: IWalletAddressRow[] | undefined,
  routeSymbol: string | undefined
): IWalletAddressRow | undefined {
  if (!rows?.length || !routeSymbol) return undefined;
  const target = normalizeReceiveSymbol(routeSymbol);
  const candidates = symbolMatchCandidates(target);
  return rows.find((r) => {
    const assetId = String(r.assetId ?? "").toUpperCase();
    const currencySymbol = String(r.currencySymbol ?? "").toUpperCase();
    return candidates.has(assetId) || candidates.has(currencySymbol);
  });
}
