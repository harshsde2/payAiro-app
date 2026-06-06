import type {
  CoinmeOrderTemplateResponse,
  CoinmeOrderTemplateTransaction,
} from "query/hooks/useCoinmeCashRamp";
import type {
  ICashOnRampDetails,
  IUnifiedTransaction,
  UnifiedTransactionStatus,
} from "screens/TSX-Screens/UnifiedTransactions/types";
import type { CashRampBarcodeParams } from "@new-ui/screens/CashRamp/LocationFinder/locationFinder.types";
import type { ActivityCashOnRampItem } from "./types";
import { isCashOnRampActivity } from "./types";

export type CashOnRampDisplayKind = "created" | "expired" | "processing" | "consumed";

export type CashOnRampDisplayStatus = {
  kind: CashOnRampDisplayKind;
  label: string;
  colorKey: "warning" | "error" | "success";
};

const CASH_ONRAMP_TITLE = "Cash Purchase";

export const CASH_ONRAMP_PROCESSING_MESSAGE =
  "We are processing your purchase. This usually take a few minutes, however in some cases it can take up to an hour.";

const CASH_ONRAMP_STATUS_PRIORITY: Record<string, number> = {
  CONSUMED: 100,
  COMPLETED: 100,
  COMPLETE: 100,
  SUCCESS: 100,
  CONFIRMED: 90,
  EXPIRED: 50,
  PROCESSING: 30,
  PENDING: 30,
  GENERATING: 30,
  CREATED: 10,
};

const CASH_ONRAMP_COMPLETED_STATUSES = new Set([
  "CONSUMED",
  "COMPLETED",
  "COMPLETE",
  "SUCCESS",
  "CONFIRMED",
]);

function collectCashOnRampStatusCandidates(item: ActivityCashOnRampItem): string[] {
  const tpl = item.quote?.partnerResponse?.data?.transactionTemplate as
    | { status?: string }
    | undefined;
  const raw = [
    item.status,
    item.quote?.details?.status,
    item.providerTransactionStatus,
    item.latestWebhookOrderTemplateStatus,
    item.latest_webhook_order_template_status,
    tpl?.status,
  ];
  return raw
    .map((s) => String(s ?? "").trim().toUpperCase())
    .filter(Boolean);
}

function normalizeStatus(item: ActivityCashOnRampItem): string {
  const statuses = collectCashOnRampStatusCandidates(item);
  if (statuses.length === 0) return "";

  return statuses.reduce((best, current) => {
    const bestP = CASH_ONRAMP_STATUS_PRIORITY[best] ?? 20;
    const currentP = CASH_ONRAMP_STATUS_PRIORITY[current] ?? 20;
    return currentP > bestP ? current : best;
  });
}

export function resolveCashOnRampDisplayStatus(
  item: ActivityCashOnRampItem
): CashOnRampDisplayStatus {
  const status = normalizeStatus(item);

  if (CASH_ONRAMP_COMPLETED_STATUSES.has(status)) {
    return {
      kind: "consumed",
      label: "Completed",
      colorKey: "success",
    };
  }
  if (status === "CREATED") {
    return {
      kind: "created",
      label: "Barcode Generated",
      colorKey: "warning",
    };
  }
  if (status === "EXPIRED") {
    return {
      kind: "expired",
      label: "Barcode Expired",
      colorKey: "error",
    };
  }
  if (status === "PROCESSING" || status === "PENDING" || status === "GENERATING") {
    return {
      kind: "processing",
      label: "Processing",
      colorKey: "warning",
    };
  }

  if (item.active === true) {
    return {
      kind: "processing",
      label: "Processing",
      colorKey: "warning",
    };
  }

  return {
    kind: "processing",
    label: "Processing",
    colorKey: "warning",
  };
}

export function getCashOnRampCardTitle(): string {
  return CASH_ONRAMP_TITLE;
}

export function formatCashOnRampFiatAmount(item: ActivityCashOnRampItem): string {
  const amt = Number.parseFloat(item.amountValue ?? "0");
  const code = (item.amountCurrencyCode ?? item.debitCurrencyCode ?? "USD").toUpperCase();
  const formatted = Number.isFinite(amt) ? amt.toFixed(2) : item.amountValue ?? "0";
  if (code === "USD") return `$${formatted}`;
  return `${formatted} ${code}`;
}

export function formatCashOnRampCryptoAmount(item: ActivityCashOnRampItem): string {
  const amt = item.creditCurrencyAmount ?? "0";
  const code = (item.creditCurrencyCode ?? "").toUpperCase();
  return code ? `${amt} ${code}` : amt;
}

function mergeFeesMap(item: ActivityCashOnRampItem): Record<string, string> {
  const fromItem = item.feesMap ?? {};
  const fromQuote = item.quote?.details?.feesMap ?? {};
  return { ...fromQuote, ...fromItem };
}

function mergeRetailerFee(item: ActivityCashOnRampItem): string | null {
  return (
    item.providerExclusiveFees?.retailerCustomerFee?.amount ??
    item.quote?.details?.providerExclusiveFees?.retailerCustomerFee?.amount ??
    null
  );
}

function sumFeeAmounts(item: ActivityCashOnRampItem): string {
  const fm = mergeFeesMap(item);
  let total = 0;
  for (const v of Object.values(fm)) {
    const n = Number.parseFloat(v);
    if (Number.isFinite(n)) total += n;
  }
  const retail = mergeRetailerFee(item);
  if (retail) {
    const n = Number.parseFloat(retail);
    if (Number.isFinite(n)) total += n;
  }
  return total > 0 ? total.toFixed(2) : "0";
}

function resolveRetailerLabel(item: ActivityCashOnRampItem): string {
  const tpl = item.quote?.partnerResponse?.data?.transactionTemplate as
    | { locationDescription?: string; provider?: string }
    | undefined;
  const desc = tpl?.locationDescription ?? tpl?.provider;
  if (desc && String(desc).trim()) return String(desc).trim();
  return "Cash purchase";
}

function toUnifiedStatus(item: ActivityCashOnRampItem): UnifiedTransactionStatus {
  const display = resolveCashOnRampDisplayStatus(item);
  if (display.kind === "consumed") return "complete";
  if (display.kind === "processing" || display.kind === "created") return "processing";
  return "cancelled";
}

function buildCashOnRampDetails(item: ActivityCashOnRampItem): ICashOnRampDetails {
  const fm = mergeFeesMap(item);
  const retailFee = mergeRetailerFee(item);
  return {
    order_status: normalizeStatus(item),
    payment_method: "Cash",
    location_reference: item.locationReference ?? null,
    retailer_label: resolveRetailerLabel(item),
    transaction_provider_ref:
      item.transactionProviderRef ?? item.quote?.transactionProviderRef ?? null,
    transaction_system_ref:
      item.transactionSystemRef ?? item.quote?.transactionSystemRef ?? null,
    credit_currency_amount: item.creditCurrencyAmount ?? null,
    credit_currency_code: item.creditCurrencyCode ?? null,
    debit_currency_unit_price: item.debitCurrencyUnitPrice ?? null,
    fees_map: fm,
    processing_fee: retailFee,
    network_fee: fm.networkFee ?? fm.network_fee ?? null,
    exchange_fee: fm.exchangeFee ?? fm.exchange_fee ?? null,
    processing_message: CASH_ONRAMP_PROCESSING_MESSAGE,
  };
}

export function mapCashOnRampToUnified(item: ActivityCashOnRampItem): IUnifiedTransaction {
  const fiat = (item.debitCurrencyCode ?? item.amountCurrencyCode ?? "USD").toUpperCase();
  const crypto = (item.creditCurrencyCode ?? "").toUpperCase();
  const txnId =
    (item.transactionSystemRef ?? item.quote?.transactionSystemRef ?? "").trim() ||
    (item.transactionProviderRef ?? item.quote?.transactionProviderRef ?? "").trim() ||
    String(item.id);
  const providerRef =
    (item.transactionProviderRef ?? item.quote?.transactionProviderRef ?? "").trim() || null;
  const cashDetails = buildCashOnRampDetails(item);
  const retailer = cashDetails.retailer_label ?? "Cash purchase";

  return {
    transaction_id: txnId,
    transaction_type: "cash_onramp",
    transaction_category: "crypto",
    status: toUnifiedStatus(item),
    amount: String(item.amountValue ?? "0"),
    final_amount: String(item.amountValue ?? "0"),
    currency: fiat,
    currency_symbol: fiat === "USD" ? "$" : fiat,
    created_at: item.createdAt,
    updated_at: item.updatedAt ?? item.createdAt,
    fee: {
      amount: sumFeeAmounts(item),
      percentage: "0",
      currency: fiat,
    },
    sender: null,
    recipient: null,
    direction: "outgoing",
    display_party: {
      username: retailer,
      profile_photo: null,
      identifier: `Cashier – ${retailer}`,
    },
    crypto_details: {
      from_currency: fiat,
      to_currency: crypto,
      network: item.chain ?? null,
      tx_hash: providerRef,
      from_address: null,
      to_address: null,
      token: crypto,
      icon_url: null,
      exchange_rate: item.debitCurrencyUnitPrice ?? null,
      usd_value: String(item.amountValue ?? "0"),
      asset: crypto,
      amount: item.creditCurrencyAmount ?? null,
    },
    bank_details: null,
    merchant_details: null,
    card_details: null,
    note: null,
    category: null,
    tags: [],
    refund_details: null,
    cash_onramp_details: cashDetails,
  };
}

function buildOrderTemplateResponseFromHistory(
  item: ActivityCashOnRampItem
): CoinmeOrderTemplateResponse | null {
  const partnerData = item.quote?.partnerResponse?.data;
  if (partnerData?.transactionTemplate) {
    return {
      ok: true,
      data: {
        transactionTemplate:
          partnerData.transactionTemplate as CoinmeOrderTemplateTransaction,
      },
    };
  }

  const providerRef =
    (item.transactionProviderRef ?? item.quote?.transactionProviderRef ?? "").trim();
  if (!providerRef) return null;

  return {
    ok: true,
    data: {
      transactionTemplate: {
        transactionProviderRef: providerRef,
        transactionSystemRef:
          item.transactionSystemRef ?? item.quote?.transactionSystemRef ?? undefined,
        debitCurrencyCode: item.debitCurrencyCode,
        creditCurrencyCode: item.creditCurrencyCode,
        creditCurrencyAmount: item.creditCurrencyAmount,
        amountValue: item.amountValue,
        amountCurrencyCode: item.amountCurrencyCode,
        feesMap: mergeFeesMap(item),
        providerExclusiveFees: item.providerExclusiveFees ?? item.quote?.details?.providerExclusiveFees,
        expiryTimestamp: item.expiryTimestamp ?? item.quote?.details?.expiryTimestamp ?? undefined,
        chain: item.chain,
      },
    },
  };
}

export function buildCashRampBarcodeParamsFromHistory(
  item: ActivityCashOnRampItem
): CashRampBarcodeParams {
  const locRef = (item.locationReference ?? "").trim();
  const orderTemplateResponse = buildOrderTemplateResponseFromHistory(item);

  return {
    amount: Number.parseFloat(item.amountValue) || 0,
    fiatCurrencyCode: (item.debitCurrencyCode ?? item.amountCurrencyCode ?? "USD").toUpperCase(),
    cryptoCurrencyCode: (item.creditCurrencyCode ?? "BTC").toUpperCase(),
    chain: (item.chain ?? "").trim().toUpperCase(),
    cashRampFlow: "buy",
    location: {
      id: locRef || String(item.id),
      locationReference: locRef || null,
    },
    resumeFromHistory: orderTemplateResponse
      ? {
          orderTemplateResponse,
          initialPhase: "barcodeVisible",
        }
      : undefined,
  };
}

export { isCashOnRampActivity };
