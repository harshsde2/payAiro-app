/**
 * Contract tests for the money-movement mutations.
 *
 * Two properties matter here and both are invisible at the call site, which is exactly
 * why they need locking down:
 *   1. every request carries an `Idempotency-Key`, and
 *   2. a failure is NEVER retried automatically (React Query's global default used to
 *      be `retry: 1`, which turned one lost response into a second transaction).
 */

import { QueryClient } from "@tanstack/react-query";
import { userApiClient } from "api/userApiClient";
import { USER_AUTH } from "api/endpoints";
import { queryClient as appQueryClient } from "query/queryClient";

jest.mock("api/userApiClient", () => ({
  userApiClient: { post: jest.fn(), get: jest.fn() },
}));

jest.mock("utils/getDeviceFingerprint", () => ({
  getDeviceFingerprint: jest.fn(async () => "test-fingerprint"),
}));

/**
 * Capture the options each hook hands to `useMutation`, so the request shape and the
 * retry policy can be asserted without a React renderer. (`jest.spyOn` can't be used —
 * react-query's exports are non-configurable.)
 */
const mockCapturedOptions: { current: any } = { current: null };
jest.mock("@tanstack/react-query", () => {
  const actual = jest.requireActual("@tanstack/react-query");
  return {
    ...actual,
    useMutation: (options: any) => {
      mockCapturedOptions.current = options;
      return { mutateAsync: options.mutationFn, mutate: options.mutationFn, isPending: false };
    },
    useQueryClient: () => ({ invalidateQueries: jest.fn() }),
  };
});

const postMock = userApiClient.post as jest.Mock;

/** Options the hook passed to `useMutation`. */
const optionsOf = (useHook: () => any): any => {
  useHook();
  return mockCapturedOptions.current;
};

/** The hook's `mutationFn`, callable directly. */
const mutationFnOf = (useHook: () => any): ((vars: any) => Promise<any>) =>
  optionsOf(useHook).mutationFn;

beforeEach(() => {
  postMock.mockReset();
  postMock.mockResolvedValue({ ok: true });
});

describe("QueryClient defaults", () => {
  it("never auto-retries mutations", () => {
    // The single highest-impact guarantee in the whole double-transaction fix.
    expect(appQueryClient.getDefaultOptions().mutations?.retry).toBe(0);
  });

  it("still retries queries, which are safe to repeat", () => {
    expect(appQueryClient.getDefaultOptions().queries?.retry).toBe(1);
  });

  it("is a real QueryClient wired with those defaults", () => {
    expect(appQueryClient).toBeInstanceOf(QueryClient);
  });
});

describe("usePaymentTransactionSend (SEND)", () => {
  const load = () => require("query/hooks/useCrypto").usePaymentTransactionSend;

  it("sends the Idempotency-Key header and keeps it out of the body", async () => {
    const mutationFn = mutationFnOf(load());
    await mutationFn({
      type: "internal",
      amount: "0.5",
      currency: "USDC",
      chain: "ETH",
      recipientUserId: "u1",
      idempotencyKey: "key-abc",
    });

    const [url, body, isFormData, headers] = postMock.mock.calls[0];
    expect(url).toBe(USER_AUTH.PAYMENT_TRANSACTIONS_SEND);
    expect(headers).toMatchObject({ "Idempotency-Key": "key-abc" });
    expect(body).not.toHaveProperty("idempotencyKey");
    expect(body).toMatchObject({ type: "internal", amount: "0.5" });
    expect(isFormData).toBe(false);
  });

  it("pins retry to 0 independently of the global default", () => {
    expect(optionsOf(load()).retry).toBe(0);
  });
});

describe("useCoinmeTradeExecute (BUY / SELL / WITHDRAW)", () => {
  const load = () => require("query/hooks/useCrypto").useCoinmeTradeExecute;

  it("sends the Idempotency-Key alongside the existing device fingerprint", async () => {
    const mutationFn = mutationFnOf(load());
    await mutationFn({
      tradeType: "buy",
      chain: "ETH",
      cryptoCurrencyCode: "USDC",
      fiatCurrencyCode: "USD",
      amountValue: "10",
      amountCurrencyCode: "USD",
      paymentMethodId: "pm1",
      sourceWalletAddress: "0xabc",
      webSessionId: "sess1",
      idempotencyKey: "key-trade",
    });

    const [url, body, , headers] = postMock.mock.calls[0];
    expect(url).toBe(USER_AUTH.COINME_TRADE_EXECUTE);
    expect(headers).toMatchObject({
      "Idempotency-Key": "key-trade",
      "x-device-fingerprint": "test-fingerprint",
    });
    expect(body).not.toHaveProperty("idempotencyKey");
    expect(body).toMatchObject({ tradeType: "buy", webSessionId: "sess1" });
  });

  it("pins retry to 0 independently of the global default", () => {
    expect(optionsOf(load()).retry).toBe(0);
  });

  it("makes exactly one request per call, even when it fails", async () => {
    postMock.mockRejectedValue(Object.assign(new Error("timeout"), { code: "ECONNABORTED" }));
    const mutationFn = mutationFnOf(load());

    await expect(mutationFn({ idempotencyKey: "key-1" })).rejects.toThrow("timeout");
    expect(postMock).toHaveBeenCalledTimes(1);
  });
});

describe("cash ramp mutations", () => {
  it("useCoinmeOrderTemplateMutation sends the key and pins retry to 0", async () => {
    const hook = require("query/hooks/useCoinmeCashRamp").useCoinmeOrderTemplateMutation;
    expect(optionsOf(hook).retry).toBe(0);

    const mutationFn = mutationFnOf(hook);
    await mutationFn({ amountValue: "10", idempotencyKey: "key-order" });

    const [url, body, , headers] = postMock.mock.calls[0];
    expect(url).toBe(USER_AUTH.COINME_ORDER_TEMPLATE);
    expect(headers).toMatchObject({ "Idempotency-Key": "key-order" });
    expect(body).not.toHaveProperty("idempotencyKey");
  });

  it("useCoinmeCashOfframpExecuteMutation sends the key and pins retry to 0", async () => {
    const hook = require("query/hooks/useCoinmeCashRamp").useCoinmeCashOfframpExecuteMutation;
    expect(optionsOf(hook).retry).toBe(0);

    const mutationFn = mutationFnOf(hook);
    await mutationFn({ amountValue: "10", idempotencyKey: "key-offramp" });

    const [url, body, , headers] = postMock.mock.calls[0];
    expect(url).toBe(USER_AUTH.COINME_CASH_OFFRAMP_EXECUTE);
    expect(headers).toMatchObject({ "Idempotency-Key": "key-offramp" });
    expect(body).not.toHaveProperty("idempotencyKey");
  });
});
