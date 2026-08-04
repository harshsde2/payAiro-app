import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FundingSource, SendPayload } from './enterAmount.types';

type UseEnterAmountStateArgs = {
  initialSelectedSource?: FundingSource | null;
  initialInputValue?: string;
  transactionFeePercent?: number; // platform fee percentage for crypto transfers
  initialInputMode?: 'fiat' | 'asset';
  /** When true, selecting a crypto source does not force asset input mode (fiat-first crypto screens). */
  preferFiatCryptoEntry?: boolean;
  /** When true (sell trade), selecting a crypto source keeps fiat input as default. */
  defaultFiatOnCryptoSource?: boolean;
  /** When true, validateCrypto() returns messages with no asset tickers or crypto jargon. */
  fiatNeutralCryptoValidation?: boolean;
};

const sanitizeAmountInput = (
  text: string,
  maxIntDigits: number,
  maxDecimals: number
): string => {
  // Allow only digits and a single decimal point.
  const cleaned = text.replace(/[^0-9.]/g, '');
  if (!cleaned) return '';

  const dotIndex = cleaned.indexOf('.');
  if (dotIndex === -1) {
    // No decimal typed yet.
    return cleaned.slice(0, maxIntDigits);
  }

  // Keep a single decimal (collapse extra dots by removing them).
  const intPartRaw = cleaned.slice(0, dotIndex);
  const decCombined = cleaned.slice(dotIndex + 1).replace(/\./g, '');

  const intCapped = intPartRaw.slice(0, maxIntDigits);
  const shouldKeepDotOnly = cleaned.endsWith('.') && decCombined.length === 0;

  if (shouldKeepDotOnly) {
    // Preserve trailing "." so user can continue typing decimals.
    return `${intCapped}.`;
  }

  const decCapped = decCombined.slice(0, maxDecimals);
  return `${intCapped}.${decCapped}`;
};

// Enough integer digits to enter any amount the transaction limits allow — the largest,
// a monthly sell cap, is $500,000 (6 digits). The old cap of 5 blocked amounts over
// $99,999 outright AND caused a reject-and-revert "shake": at the 6th digit the native
// field briefly showed the extra character before sanitize sliced it back. Over-limit
// amounts are still caught by the limit meter / balance validation, not by this cap.
const MAX_INT_DIGITS = 7;

const safeParseAmount = (sanitizedInput: string): number => {
  if (!sanitizedInput || sanitizedInput === '.') return 0;
  const n = Number(sanitizedInput);
  if (!Number.isFinite(n)) return 0;
  return n;
};

export const useEnterAmountState = ({
  initialSelectedSource = null,
  initialInputValue = '',
  transactionFeePercent = 0,
  initialInputMode = 'fiat',
  preferFiatCryptoEntry = false,
  defaultFiatOnCryptoSource = false,
  fiatNeutralCryptoValidation = false,
}: UseEnterAmountStateArgs) => {
  const [inputValue, setInputValue] = useState<string>(initialInputValue);
  const [inputMode, setInputMode] = useState<'fiat' | 'asset'>(initialInputMode);
  const [selectedSource, setSelectedSource] = useState<FundingSource | null>(
    initialSelectedSource
  );

  useEffect(() => {
    setSelectedSource((prev) => {
      if (prev !== null) return prev;
      return initialSelectedSource ?? null;
    });
  }, [initialSelectedSource]);

  // Clear the amount when the user switches to a DIFFERENT funding source — the entered
  // number was specific to the previous asset/account (e.g. "0.05" meant 0.05 BTC, which
  // is meaningless once ETH is selected). Skips the initial null → first-source assignment
  // so a preset initial amount (e.g. a requested amount) isn't wiped on mount.
  const prevSourceIdRef = useRef<string | null>(selectedSource?.id ?? null);
  useEffect(() => {
    const currentId = selectedSource?.id ?? null;
    if (
      prevSourceIdRef.current !== null &&
      currentId !== null &&
      prevSourceIdRef.current !== currentId
    ) {
      setInputValue('');
    }
    prevSourceIdRef.current = currentId;
  }, [selectedSource?.id]);

  const feePercent = useMemo(() => {
    const n = Number(transactionFeePercent);
    return Number.isFinite(n) ? n : 0;
  }, [transactionFeePercent]);

  const viewMode = useMemo<'fiat' | 'crypto'>(
    () => (selectedSource?.type === 'crypto' ? 'crypto' : 'fiat'),
    [selectedSource?.type]
  );

  const amountInputLimits = useMemo(() => {
    // Fiat/banking rule: max 2 decimals.
    if (viewMode !== 'crypto') {
      return { maxIntDigits: MAX_INT_DIGITS, maxDecimals: 2 };
    }
    if ((preferFiatCryptoEntry || defaultFiatOnCryptoSource) && inputMode === 'fiat') {
      return { maxIntDigits: MAX_INT_DIGITS, maxDecimals: 2 };
    }
    // Crypto rule: max 8 decimals (so a full-precision crypto balance — e.g. BTC's
    // 8 dp — is enterable and Max can equal the real balance).
    return { maxIntDigits: MAX_INT_DIGITS, maxDecimals: 8 };
  }, [defaultFiatOnCryptoSource, inputMode, preferFiatCryptoEntry, viewMode]);

  // Native cap for the TextInput (`maxLength`). Capping at the source stops the field
  // from ever accepting a character sanitize would reject, which is what removes the
  // flicker — the value never overshoots and gets snapped back. +1 for the decimal point.
  const maxInputLength = useMemo(
    () => amountInputLimits.maxIntDigits + 1 + amountInputLimits.maxDecimals,
    [amountInputLimits.maxDecimals, amountInputLimits.maxIntDigits]
  );

  const parsedInput = useMemo(() => safeParseAmount(inputValue), [inputValue]);

  const amount = useMemo(() => {
    if (viewMode !== 'crypto') return parsedInput;
    const price = selectedSource?.cryptoMeta?.priceUSD ?? 0;
    if (!price || price <= 0) return parsedInput;
    if (inputMode === 'asset') {
      return parsedInput * price;
    }
    return parsedInput;
  }, [inputMode, parsedInput, selectedSource?.cryptoMeta?.priceUSD, viewMode]);

  const assetAmount = useMemo(() => {
    if (viewMode !== 'crypto') return 0;
    const price = selectedSource?.cryptoMeta?.priceUSD ?? 0;
    if (!price || price <= 0) return 0;
    if (inputMode === 'asset') return parsedInput;
    return parsedInput / price;
  }, [inputMode, parsedInput, selectedSource?.cryptoMeta?.priceUSD, viewMode]);

  const maxAsset = useMemo(() => {
    if (viewMode !== 'crypto') return 0;
    // Full balance — the frontend no longer applies a transaction fee to sends.
    const balanceAsset = Number(selectedSource?.balance ?? 0);
    if (!Number.isFinite(balanceAsset) || balanceAsset <= 0) return 0;
    return Math.max(0, balanceAsset);
  }, [selectedSource?.balance, viewMode]);

  const maxUsd = useMemo(() => {
    if (viewMode !== 'crypto') return 0;
    const priceUSD = selectedSource?.cryptoMeta?.priceUSD ?? 0;
    if (!priceUSD || priceUSD <= 0) return 0;
    return maxAsset * priceUSD;
  }, [maxAsset, selectedSource?.cryptoMeta?.priceUSD, viewMode]);

  const isValid = useMemo(
    () => amount > 0 && selectedSource !== null,
    [amount, selectedSource]
  );

  const displayAmount = useMemo(() => {
    // Raw input for the user (no formatting yet), but keep a safe fallback for sizing logic.
    return inputValue || '0.00';
  }, [inputValue]);

  const onChangeAmountText = useCallback(
    (text: string) => {
      const sanitized = sanitizeAmountInput(
        text,
        amountInputLimits.maxIntDigits,
        amountInputLimits.maxDecimals
      );
      setInputValue(sanitized);
    },
    [amountInputLimits.maxDecimals, amountInputLimits.maxIntDigits]
  );

  const toggleInputMode = useCallback(() => {
    const nextMode = inputMode === 'fiat' ? 'asset' : 'fiat';
    const price = selectedSource?.cryptoMeta?.priceUSD ?? 0;
    // Convert the current value so the economic amount stays the same across units
    // (e.g. 0.05372 BTC ⇄ $3,457), instead of re-labelling the raw digits.
    if (viewMode === 'crypto' && price > 0) {
      const current = safeParseAmount(inputValue);
      if (current > 0) {
        const converted = nextMode === 'asset' ? current / price : current * price;
        const decimals = nextMode === 'fiat' ? 2 : 8;
        // Normal rounding so repeated swaps stay stable (flooring every time would shave
        // a bit off on each round-trip and the value would visibly shrink). The tiny
        // Max-boundary overshoot this can introduce is absorbed by validateCrypto's
        // price-based tolerance, and the payload is clamped to the real balance.
        setInputValue(converted.toFixed(decimals).replace(/\.?0+$/, '') || '0');
      }
    }
    setInputMode(nextMode);
  }, [inputMode, inputValue, selectedSource?.cryptoMeta?.priceUSD, viewMode]);

  const fillMax = useCallback(() => {
    if (viewMode !== 'crypto') return;
    // Always fill as asset amount; the UI toggle can show USD equivalent.
    setInputMode('asset');
    const raw = Number.isFinite(maxAsset) ? maxAsset : 0;
    // FLOOR (not round) to 8 dp so the filled value can never exceed the real balance
    // and trip the "insufficient" validator; strip trailing zeros for a clean display.
    const floored = Math.floor(raw * 1e8) / 1e8;
    const nextText = floored.toFixed(8).replace(/\.?0+$/, '') || '0';
    onChangeAmountText(nextText);
  }, [maxAsset, onChangeAmountText, viewMode]);

  const handleSetSelectedSource = useCallback(
    (source: FundingSource | null) => {
      setSelectedSource(source);
      if (preferFiatCryptoEntry || defaultFiatOnCryptoSource) {
        return;
      }
      if (source?.type === 'crypto') {
        setInputMode('asset');
        return;
      }
      setInputMode('fiat');
    },
    [defaultFiatOnCryptoSource, preferFiatCryptoEntry]
  );

  const displayFiatEquivalent = useMemo(() => {
    if (viewMode !== 'crypto') return '';
    if (inputMode === 'asset') return amount;
    return parsedInput;
  }, [amount, inputMode, parsedInput, viewMode]);

  const displayAssetEquivalent = useMemo(() => {
    if (viewMode !== 'crypto') return '';
    if (inputMode === 'asset') return parsedInput;
    return assetAmount;
  }, [assetAmount, inputMode, parsedInput, viewMode]);

  const validateCrypto = useCallback((): string[] => {
    if (viewMode !== 'crypto') return [];
    if (!selectedSource || selectedSource.type !== 'crypto') {
      return [
        fiatNeutralCryptoValidation
          ? 'Withdrawal is unavailable right now.'
          : 'Please select a crypto asset',
      ];
    }

    const cryptoMeta = selectedSource.cryptoMeta;
    const priceUSD = cryptoMeta?.priceUSD ?? 0;
    const symbol = cryptoMeta?.symbol ?? selectedSource.name ?? 'CRYPTO';

    const errors: string[] = [];
    if (!priceUSD || priceUSD <= 0) {
      errors.push(
        fiatNeutralCryptoValidation
          ? 'Withdrawal is temporarily unavailable. Please try again later.'
          : 'Invalid crypto price'
      );
    }

    // In crypto mode, `amount` represents USD equivalent (based on inputMode).
    // if (amount < 1) {
    //   errors.push(
    //     fiatNeutralCryptoValidation
    //       ? '$2.00 or more is required.'
    //       : '$2.00 or more is required to send'
    //   );
    // }

    if (assetAmount <= 0) {
      errors.push(
        fiatNeutralCryptoValidation ? 'Please enter a valid amount.' : 'Invalid crypto amount'
      );
    }

    // Tolerate the ≤1-cent USD display-rounding wobble (converted to asset units) so an
    // exact Max round-tripped through USD doesn't falsely read as over-balance. Genuine
    // overages (more than a cent over) are still caught. The payload is clamped to the
    // real balance so we never actually send more than the user holds.
    const overBalanceTolerance = priceUSD > 0 ? 0.01 / priceUSD : 1e-8;
    if (__DEV__ && assetAmount > maxAsset + overBalanceTolerance) {
      // Diagnostic for "entered less than my balance but still insufficient". Prints every
      // value that feeds the comparison so the failing term is obvious.
      console.log('[EnterAmount] balance check FAILED', {
        typed: parsedInput,
        inputMode,
        symbol,
        priceUSD,
        amountUSD: amount,
        assetAmount,
        maxAsset,
        maxUsdFromPrice: maxAsset * priceUSD,
        overBalanceTolerance,
        overBy: assetAmount - maxAsset,
      });
    }
    if (assetAmount > maxAsset + overBalanceTolerance) {
      if (fiatNeutralCryptoValidation) {
        errors.push('Insufficient balance for this withdrawal.');
      } else if (inputMode === 'fiat') {
        // Quote the max in the unit the user is actually typing. Showing token units next to a
        // dollar field reads as a number they are already under, so the error looks wrong.
        // FLOOR to cents so the quoted figure is one they can retype and have accepted.
        const maxUsdLabel = (Math.floor(maxAsset * priceUSD * 100) / 100).toFixed(2);
        errors.push(`Insufficient balance. Max send: $${maxUsdLabel}`);
      } else {
        const maxLabel = maxAsset.toFixed(8).replace(/\.?0+$/, '') || '0';
        errors.push(`Insufficient balance. Max send: ${maxLabel} ${symbol}`);
      }
    }

    return errors;
  }, [
    amount,
    assetAmount,
    fiatNeutralCryptoValidation,
    inputMode,
    maxAsset,
    parsedInput,
    selectedSource,
    viewMode,
  ]);

  const cryptoIsValid = useMemo(() => validateCrypto().length === 0, [validateCrypto]);

  const buildPayload = useCallback(
    (recipient: string, currency: 'USD' = 'USD'): SendPayload => {
      if (!selectedSource) {
        // UI disables Pay via `isValid`, so this is a guardrail.
        throw new Error('Cannot build payload: selectedSource is null');
      }

      return {
        recipient,
        amount,
        sourceId: selectedSource.id,
        currency,
      };
    },
    [amount, selectedSource]
  );

  return {
    // single source of truth
    inputValue,
    amount,
    selectedSource,
    viewMode,
    inputMode,
    isValid: viewMode !== 'crypto' ? isValid : cryptoIsValid,

    // derived display values
    displayAmount,
    displayFiatEquivalent,
    displayAssetEquivalent,
    assetAmount,
    maxAsset,
    maxUsd,
    maxInputLength,
    feePercent,

    // setters / handlers
    setSelectedSource: handleSetSelectedSource,
    onChangeAmountText,
    toggleInputMode,
    fillMax,

    // payload contract builder
    buildPayload,

    // crypto-specific validation helper
    validateCrypto,
  };
};

