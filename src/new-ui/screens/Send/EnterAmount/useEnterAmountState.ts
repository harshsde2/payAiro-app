import { useCallback, useMemo, useState } from 'react';
import { FundingSource, SendPayload } from './enterAmount.types';

type UseEnterAmountStateArgs = {
  initialSelectedSource?: FundingSource | null;
  initialInputValue?: string;
  transactionFeePercent?: number; // platform fee percentage for crypto transfers
};

const sanitizeAmountInput = (text: string): string => {
  // Allow only digits and a single decimal point.
  const cleaned = text.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length <= 2) return cleaned;
  return parts[0] + '.' + parts.slice(1).join('');
};

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
}: UseEnterAmountStateArgs) => {
  const [inputValue, setInputValue] = useState<string>(initialInputValue);
  const [inputMode, setInputMode] = useState<'fiat' | 'asset'>('fiat');
  const [selectedSource, setSelectedSource] = useState<FundingSource | null>(
    initialSelectedSource
  );

  const feePercent = useMemo(() => {
    const n = Number(transactionFeePercent);
    return Number.isFinite(n) ? n : 0;
  }, [transactionFeePercent]);

  const viewMode = useMemo<'fiat' | 'crypto'>(
    () => (selectedSource?.type === 'crypto' ? 'crypto' : 'fiat'),
    [selectedSource?.type]
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
    const balanceAsset = Number(selectedSource?.balance ?? 0);
    if (!Number.isFinite(balanceAsset) || balanceAsset <= 0) return 0;
    if (!feePercent || feePercent <= 0) return balanceAsset;
    const effectiveFee = (balanceAsset * feePercent) / 100;
    const max = balanceAsset - effectiveFee;
    if (!Number.isFinite(max)) return 0;
    return Math.max(0, max);
  }, [feePercent, selectedSource?.balance, viewMode]);

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

  const onChangeAmountText = useCallback((text: string) => {
    const sanitized = sanitizeAmountInput(text);
    setInputValue(sanitized);
  }, []);

  const toggleInputMode = useCallback(() => {
    setInputMode((prev) => (prev === 'fiat' ? 'asset' : 'fiat'));
  }, []);

  const fillMax = useCallback(() => {
    if (viewMode !== 'crypto') return;
    // Always fill as asset amount; the UI toggle can show USD equivalent.
    setInputMode('asset');
    const next = Number.isFinite(maxAsset) ? maxAsset : 0;
    // Keep enough precision for crypto but avoid scientific notation.
    const nextText = next.toFixed(8);
    onChangeAmountText(nextText);
  }, [maxAsset, onChangeAmountText, viewMode]);

  const handleSetSelectedSource = useCallback((source: FundingSource | null) => {
    setSelectedSource(source);
    if (source?.type === 'crypto') {
      setInputMode('asset');
      return;
    }
    setInputMode('fiat');
  }, []);

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
      return ['Please select a crypto asset'];
    }

    const cryptoMeta = selectedSource.cryptoMeta;
    const priceUSD = cryptoMeta?.priceUSD ?? 0;
    const symbol = cryptoMeta?.symbol ?? selectedSource.name ?? 'CRYPTO';

    const errors: string[] = [];
    if (!priceUSD || priceUSD <= 0) {
      errors.push('Invalid crypto price');
    }

    // In crypto mode, `amount` represents USD equivalent (based on inputMode).
    if (amount < 2) {
      errors.push('$2.00 or more is required to send');
    }

    if (assetAmount <= 0) {
      errors.push('Invalid crypto amount');
    }

    // `maxAsset` already includes platform fee percent (fee-adjusted max you can send).
    if (assetAmount > maxAsset) {
      const maxDigits = maxAsset >= 1 ? 4 : 8;
      errors.push(
        `Insufficient balance. Max send after fees: ${maxAsset.toFixed(maxDigits)} ${symbol}`
      );
    }

    return errors;
  }, [amount, assetAmount, maxAsset, selectedSource, viewMode]);

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

