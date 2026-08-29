import {
  __resetTransactionGuard,
  begin,
  buildIntentSignature,
  DUPLICATE_WINDOW_MS,
  forceNewAttempt,
  isInFlight,
  isOutcomeUnknown,
  settle,
} from "../transactionGuard";
import { newIdempotencyKey } from "utils/idempotency";

const SEND_10_TO_ALICE = buildIntentSignature(["send", "internal", "ETH", "USDC", "10", "alice"]);

beforeEach(() => {
  __resetTransactionGuard();
});

describe("transactionGuard — in-flight protection", () => {
  it("refuses a second claim while the first is still running", () => {
    const first = begin(SEND_10_TO_ALICE);
    const second = begin(SEND_10_TO_ALICE);

    expect(first.ok).toBe(true);
    expect(second).toMatchObject({ ok: false, reason: "in-flight" });
  });

  it("reports in-flight state until the intent settles", () => {
    begin(SEND_10_TO_ALICE);
    expect(isInFlight(SEND_10_TO_ALICE)).toBe(true);

    settle(SEND_10_TO_ALICE, "succeeded");
    expect(isInFlight(SEND_10_TO_ALICE)).toBe(false);
  });

  it("releases the claim even when the attempt failed", () => {
    begin(SEND_10_TO_ALICE);
    settle(SEND_10_TO_ALICE, "rejected");

    expect(begin(SEND_10_TO_ALICE).ok).toBe(true);
  });
});

describe("transactionGuard — duplicate window", () => {
  it("blocks an identical intent after it succeeded", () => {
    begin(SEND_10_TO_ALICE);
    settle(SEND_10_TO_ALICE, "succeeded");

    expect(begin(SEND_10_TO_ALICE)).toMatchObject({ ok: false, reason: "succeeded" });
  });

  it("blocks an identical intent after an unconfirmed outcome", () => {
    begin(SEND_10_TO_ALICE);
    settle(SEND_10_TO_ALICE, "unknown");

    expect(begin(SEND_10_TO_ALICE)).toMatchObject({ ok: false, reason: "unknown" });
  });

  it("stops blocking once the duplicate window has passed", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-20T00:00:00Z"));
    begin(SEND_10_TO_ALICE);
    settle(SEND_10_TO_ALICE, "succeeded");
    expect(begin(SEND_10_TO_ALICE).ok).toBe(false);

    jest.setSystemTime(Date.now() + DUPLICATE_WINDOW_MS + 1);
    expect(begin(SEND_10_TO_ALICE).ok).toBe(true);
    jest.useRealTimers();
  });

  it("never blocks a genuinely different transaction", () => {
    const send20 = buildIntentSignature(["send", "internal", "ETH", "USDC", "20", "alice"]);

    begin(SEND_10_TO_ALICE);
    settle(SEND_10_TO_ALICE, "succeeded");

    expect(begin(send20).ok).toBe(true);
  });

  it("a rejected attempt does not count as a duplicate", () => {
    begin(SEND_10_TO_ALICE);
    settle(SEND_10_TO_ALICE, "rejected");

    expect(begin(SEND_10_TO_ALICE)).toMatchObject({ ok: true });
  });
});

describe("transactionGuard — idempotency keys", () => {
  it("reuses the same key across retries of one intent", () => {
    const first = begin(SEND_10_TO_ALICE);
    settle(SEND_10_TO_ALICE, "rejected");
    const retry = begin(SEND_10_TO_ALICE);

    expect(retry.idempotencyKey).toBe(first.idempotencyKey);
  });

  it("keeps the key stable on the blocked result too, so a replay still dedupes", () => {
    const first = begin(SEND_10_TO_ALICE);
    const blocked = begin(SEND_10_TO_ALICE);

    expect(blocked.idempotencyKey).toBe(first.idempotencyKey);
  });

  it("gives a different key to a different intent", () => {
    const a = begin(SEND_10_TO_ALICE);
    const b = begin(buildIntentSignature(["send", "internal", "ETH", "USDC", "20", "alice"]));

    expect(b.idempotencyKey).not.toBe(a.idempotencyKey);
  });

  it("mints a fresh key when the user confirms a deliberate repeat", () => {
    const first = begin(SEND_10_TO_ALICE);
    settle(SEND_10_TO_ALICE, "succeeded");

    forceNewAttempt(SEND_10_TO_ALICE);
    const repeat = begin(SEND_10_TO_ALICE);

    expect(repeat.ok).toBe(true);
    expect(repeat.idempotencyKey).not.toBe(first.idempotencyKey);
  });
});

describe("buildIntentSignature", () => {
  it("is stable for the same inputs", () => {
    expect(buildIntentSignature(["trade", "buy", "ETH", "10"])).toBe(
      buildIntentSignature(["trade", "buy", "ETH", "10"]),
    );
  });

  it("changes when any field changes", () => {
    const base = buildIntentSignature(["trade", "buy", "ETH", "10"]);

    expect(buildIntentSignature(["trade", "sell", "ETH", "10"])).not.toBe(base);
    expect(buildIntentSignature(["trade", "buy", "BTC", "10"])).not.toBe(base);
    expect(buildIntentSignature(["trade", "buy", "ETH", "20"])).not.toBe(base);
  });

  it("normalises case and whitespace so formatting noise can't split one intent", () => {
    expect(buildIntentSignature([" Trade ", "BUY"])).toBe(buildIntentSignature(["trade", "buy"]));
  });

  it("distinguishes a missing field from an empty one only by position", () => {
    expect(buildIntentSignature(["a", undefined, "b"])).toBe(buildIntentSignature(["a", null, "b"]));
    expect(buildIntentSignature(["a", "b"])).not.toBe(buildIntentSignature(["a", undefined, "b"]));
  });
});

describe("newIdempotencyKey", () => {
  it("produces uuid-v4 shaped values", () => {
    expect(newIdempotencyKey()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("does not collide across many mints", () => {
    const keys = new Set(Array.from({ length: 10000 }, () => newIdempotencyKey()));
    expect(keys.size).toBe(10000);
  });
});

describe("isOutcomeUnknown", () => {
  it("treats a timeout as unknown — the transaction may exist", () => {
    expect(isOutcomeUnknown({ code: "ECONNABORTED", message: "timeout of 30000ms exceeded" })).toBe(
      true,
    );
    expect(isOutcomeUnknown({ code: "ERR_NETWORK", message: "Network Error" })).toBe(true);
  });

  it("treats any HTTP response as a known outcome", () => {
    expect(isOutcomeUnknown({ response: { status: 400 }, message: "Bad Request" })).toBe(false);
    // A 500 still means the backend answered, so the caller can trust its own error copy.
    expect(isOutcomeUnknown({ response: { status: 500 }, message: "timeout" })).toBe(false);
  });

  it("is false for a plain non-network error", () => {
    expect(isOutcomeUnknown(new Error("Select an asset"))).toBe(false);
    expect(isOutcomeUnknown(undefined)).toBe(false);
  });
});
