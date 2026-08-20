import {
  useCoinmeCashOfframpExecuteMutation,
  type CoinmeCashOfframpExecuteResponse,
} from "query/hooks/useCoinmeCashRamp";
import {
  begin,
  buildIntentSignature,
  isOutcomeUnknown,
  settle,
  type SettleOutcome,
} from "services/transactionGuard";
import { ERR_CASH_OFF_RAMP, ERR_MISSING_CHAIN, ERR_MISSING_LOCATION, ERR_MISSING_WALLET } from "../cashRampBarcodeCopy";
import type { SellCashRampPostExecute, SellCashRampSession } from "./sellFlow.types";

export class SellExecuteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SellExecuteError";
  }
}

export function mapSessionToOfframpRequest(session: SellCashRampSession) {
  const locationRef = String(session.location?.locationReference ?? "").trim();
  const wallet = String(session.sourceWalletAddress ?? "").trim();
  const chain = String(session.chain ?? "").trim();
  const crypto = String(session.cryptoCurrencyCode ?? "").toUpperCase();
  const fiat = String(session.fiatCurrencyCode ?? "USD").toUpperCase();

  if (!locationRef) throw new SellExecuteError(ERR_MISSING_LOCATION);
  if (!wallet) throw new SellExecuteError(ERR_MISSING_WALLET);
  if (!chain) throw new SellExecuteError(ERR_MISSING_CHAIN);

  return {
    amountValue: String(session.amountUsd),
    amountCurrencyCode: fiat,
    locationReference: locationRef,
    sourceWalletAddress: wallet,
    debitCurrencyCode: crypto,
    chain,
  };
}

function extractPartnerTransactionId(res: CoinmeCashOfframpExecuteResponse): string {
  const raw = res as CoinmeCashOfframpExecuteResponse & {
    transaction?: { partnerTransactionId?: string };
  };
  return String(
    raw?.data?.transaction?.partnerTransactionId ??
      raw?.transaction?.partnerTransactionId ??
      ""
  ).trim();
}

export function parsePostExecuteFromResponse(
  res: CoinmeCashOfframpExecuteResponse
): SellCashRampPostExecute {
  if (res?.ok === false) {
    throw new SellExecuteError(res?.message || ERR_CASH_OFF_RAMP);
  }
  const partnerTransactionId = extractPartnerTransactionId(res);
  if (!partnerTransactionId) {
    throw new SellExecuteError(ERR_CASH_OFF_RAMP);
  }
  return {
    partnerTransactionId,
    quote: res.data?.quote,
    transaction: res.data?.transaction,
  };
}

export function useSellExecute() {
  const mutation = useCoinmeCashOfframpExecuteMutation();

  const executeSell = async (session: SellCashRampSession): Promise<SellCashRampPostExecute> => {
    try {
      const body = mapSessionToOfframpRequest(session);
      // The calling screen holds its own in-flight ref, but that only stops a repeat
      // from THIS mount. The guard's key survives remounts and rides along on the
      // request so a deduping backend collapses any repeat into one off-ramp.
      const signature = buildIntentSignature([
        "cash-offramp",
        body.chain,
        body.debitCurrencyCode,
        body.amountValue,
        body.amountCurrencyCode,
        body.locationReference,
        body.sourceWalletAddress,
      ]);
      const claim = begin(signature);
      let outcome: SettleOutcome = "rejected";
      try {
        const res = await mutation.mutateAsync({
          ...body,
          idempotencyKey: claim.idempotencyKey,
        });
        outcome = "succeeded";
        return parsePostExecuteFromResponse(res);
      } catch (err) {
        outcome = isOutcomeUnknown(err) ? "unknown" : "rejected";
        throw err;
      } finally {
        settle(signature, outcome);
      }
    } catch (e) {
      if (e instanceof SellExecuteError) throw e;
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      const msg =
        err?.response?.data?.message || err?.message || ERR_CASH_OFF_RAMP;
      throw new SellExecuteError(msg);
    }
  };

  return {
    executeSell,
    isPending: mutation.isPending,
  };
}
