export function formatAtomicToDecimal(amountAtomic: string | number | null | undefined, decimals: number): number {
  if (amountAtomic === null || amountAtomic === undefined) return 0;

  // Use BigInt for safe integer math; accept string or number input
  let atomicStr = typeof amountAtomic === "number" ? String(amountAtomic) : amountAtomic;

  // Guard against invalid inputs
  if (!/^\d+$/.test(atomicStr)) return 0;

  const atomic = BigInt(atomicStr);
  const base = BigInt(10) ** BigInt(Math.max(0, decimals));

  // Split integer and fractional parts using BigInt division and remainder
  const integerPart = atomic / base;
  const fractionalPart = atomic % base;

  if (fractionalPart === BigInt(0)) {
    return Number(integerPart);
  }

  // Build a normalized decimal string, trimming trailing zeros
  const fractionalStrRaw = fractionalPart.toString().padStart(decimals, "0");
  const fractionalStr = fractionalStrRaw.replace(/0+$/, "");

  const asString = `${integerPart.toString()}.${fractionalStr}`;

  // Convert to Number for UI usage; callers can format to fixed if needed
  const asNumber = Number(asString);
  return Number.isFinite(asNumber) ? asNumber : 0;
}

// Common decimals helper by asset symbol if needed
export function getAssetDecimals(symbol?: string): number {
  if (!symbol) return 16; // default to 18 like ETH
  const sym = symbol.toUpperCase();
  switch (sym) {
    case "ETH":
        return 16;
    case "MATIC":
      return 18;
    case "BTC":
      return 8;
    case "USDC":
    case "USDT":
      return 6;
    default:
      return 16;
  }
}


