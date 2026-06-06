/**
 * @jest-environment node
 */
import type { ActivityTradeItem } from "../types";
import {
  formatTradeCryptoAmount,
  formatTradeFiatAmount,
  getTradeCardTitle,
  resolveTradeDisplayStatus,
  tradeDisplayStatusToUnified,
} from "../tradeActivity";

const baseBuy = (overrides: Partial<ActivityTradeItem> = {}): ActivityTradeItem => ({
  activity: "TRADE_BUY",
  id: 1,
  chain: "ETH",
  createdAt: "2026-05-28T20:10:22.984462+00:00",
  source: "caas_trade",
  amountCurrencyCode: "USD",
  amountValue: "40",
  cryptoCurrencyCode: "BTC",
  fiatCurrencyCode: "USD",
  tradeType: "buy",
  ...overrides,
});

const baseSell = (overrides: Partial<ActivityTradeItem> = {}): ActivityTradeItem => ({
  activity: "TRADE_SELL",
  id: 2,
  chain: "ETH",
  createdAt: "2026-05-26T20:33:39.101914+00:00",
  source: "caas_trade",
  amountCurrencyCode: "USD",
  amountValue: "20",
  cryptoCurrencyCode: "BTC",
  fiatCurrencyCode: "USD",
  tradeType: "sell",
  ...overrides,
});

describe("resolveTradeDisplayStatus", () => {
  it("returns Completed for COMPLETED status", () => {
    const item = baseBuy({ status: "COMPLETED", orderStatus: "COMPLETED" });
    expect(resolveTradeDisplayStatus(item)).toEqual({
      kind: "completed",
      label: "Completed",
      colorKey: "success",
    });
  });

  it("returns Completed for TRADE_SELL when completed", () => {
    const item = baseSell({ status: "COMPLETED", orderStatus: "COMPLETED" });
    expect(resolveTradeDisplayStatus(item).label).toBe("Completed");
    expect(resolveTradeDisplayStatus(item).colorKey).toBe("success");
  });

  it("returns Processing for CREATED status", () => {
    const item = baseBuy({ status: "CREATED", orderStatus: "CREATED" });
    expect(resolveTradeDisplayStatus(item)).toEqual({
      kind: "processing",
      label: "Processing",
      colorKey: "warning",
    });
  });

  it("prefers higher-priority status when orderStatus and status differ", () => {
    const item = baseBuy({ status: "CREATED", orderStatus: "COMPLETED" });
    expect(resolveTradeDisplayStatus(item).kind).toBe("completed");
  });
});

describe("getTradeCardTitle", () => {
  it("returns Crypto Purchase for buy", () => {
    expect(getTradeCardTitle(baseBuy())).toBe("Crypto Purchase");
  });

  it("returns Crypto Sale for sell", () => {
    expect(getTradeCardTitle(baseSell())).toBe("Crypto Sale");
  });
});

describe("formatTradeFiatAmount / formatTradeCryptoAmount", () => {
  it("formats fiat and crypto from quote.details on buy", () => {
    const item = baseBuy({
      quote: {
        details: {
          debitCurrencyAmount: "40",
          debitCurrencyCode: "USD",
          creditCurrencyAmount: "0.00044444",
          creditCurrencyCode: "BTC",
        },
      },
    });
    expect(formatTradeFiatAmount(item)).toBe("$40.00");
    expect(formatTradeCryptoAmount(item)).toBe("0.00044444 BTC");
  });

  it("derives crypto from usdPrice when details missing on buy", () => {
    const item = baseBuy({ amountValue: "40", amountCurrencyCode: "USD" });
    expect(formatTradeCryptoAmount(item, 80000)).toBe("0.0005 BTC");
  });

  it("formats sell amounts from quote.details", () => {
    const item = baseSell({
      quote: {
        details: {
          debitCurrencyAmount: "0.00031357",
          debitCurrencyCode: "BTC",
          creditCurrencyAmount: "24",
          creditCurrencyCode: "USD",
        },
      },
    });
    expect(formatTradeFiatAmount(item)).toBe("$24.00");
    expect(formatTradeCryptoAmount(item)).toBe("0.00031357 BTC");
  });
});

describe("tradeDisplayStatusToUnified", () => {
  it("maps completed to complete and processing to processing", () => {
    expect(
      tradeDisplayStatusToUnified(resolveTradeDisplayStatus(baseBuy({ status: "COMPLETED" })))
    ).toBe("complete");
    expect(
      tradeDisplayStatusToUnified(resolveTradeDisplayStatus(baseBuy({ status: "CREATED" })))
    ).toBe("processing");
  });
});
