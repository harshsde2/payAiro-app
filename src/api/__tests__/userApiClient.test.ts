/**
 * Tests for the 401 refresh interceptor.
 *
 * The rule being locked down: a token refresh may replay a SAFE request, but must never
 * replay a POST. If the access token expires while a trade is being processed, the
 * backend can have already booked it before rejecting the stale-token connection —
 * replaying the body books it a second time.
 *
 * Requests are intercepted with a custom axios adapter (no extra dev dependency), which
 * also keeps the real interceptor chain in play — that is the thing under test.
 */

jest.mock("utils/toast", () => ({
  showError: jest.fn(),
  showSuccess: jest.fn(),
  showInfo: jest.fn(),
  getApiErrorMessage: jest.fn(() => "error"),
}));

jest.mock("storage/mmkv", () => {
  const store: Record<string, string> = {};
  return {
    STORAGE_KEYS: { AUTH_TOKENS: "auth_tokens" },
    getItem: jest.fn((key: string) => store[key]),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    __store: store,
  };
});

/** Real axios instances created by the module under test, so we can swap the adapter. */
const mockCreatedInstances: any[] = [];
jest.mock("axios", () => {
  const actual = jest.requireActual("axios");
  return {
    __esModule: true,
    ...actual,
    default: {
      ...actual.default,
      create: (config: any) => {
        const instance = actual.default.create(config);
        mockCreatedInstances.push(instance);
        return instance;
      },
    },
  };
});

type Handler = (config: any) => { status: number; data?: any };

describe("userApiClient — 401 refresh + replay policy", () => {
  let userApiClient: any;
  let USER_AUTH: any;
  let calls: { method: string; url: string }[];
  let handlers: { match: (url: string) => boolean; handler: Handler }[];

  const respondTo = (urlPart: string, handler: Handler) => {
    handlers.push({ match: (url) => url.includes(urlPart), handler });
  };

  const countCalls = (urlPart: string) =>
    calls.filter((c) => c.url.includes(urlPart)).length;

  beforeEach(() => {
    jest.resetModules();
    mockCreatedInstances.length = 0;
    calls = [];
    handlers = [];
    // Must be required AFTER resetModules — the module under test gets a fresh copy of
    // the mock, so seeding a stale one leaves it with no refresh token.
    require("storage/mmkv").__store.auth_tokens = JSON.stringify({
      access: "old-access",
      refresh: "refresh-token",
    });

    userApiClient = require("../userApiClient").userApiClient;
    USER_AUTH = require("../endpoints").USER_AUTH;

    const instance = mockCreatedInstances[0];
    instance.defaults.adapter = (config: any) => {
      const url = String(config.url ?? "");
      calls.push({ method: String(config.method).toLowerCase(), url });
      const entry = handlers.find((h) => h.match(url));
      const { status, data } = entry
        ? entry.handler(config)
        : { status: 404, data: {} };
      const response = { data, status, statusText: "", headers: {}, config };
      return status >= 200 && status < 300
        ? Promise.resolve(response)
        : Promise.reject(
            Object.assign(new Error(`Request failed with status ${status}`), {
              response,
              config,
              isAxiosError: true,
            }),
          );
    };
  });

  it("replays a GET after a successful refresh", async () => {
    respondTo(USER_AUTH.TOKEN_REFRESH, () => ({
      status: 200,
      data: { access: "new-access", refresh: "new-refresh" },
    }));
    respondTo("/safe", () =>
      countCalls("/safe") === 1
        ? { status: 401, data: { code: "token_not_valid" } }
        : { status: 200, data: { ok: true } },
    );

    await expect(userApiClient.get("/safe")).resolves.toEqual({ ok: true });
    expect(countCalls("/safe")).toBe(2);
  });

  it("refreshes but does NOT replay a POST — the transaction may already exist", async () => {
    respondTo(USER_AUTH.TOKEN_REFRESH, () => ({
      status: 200,
      data: { access: "new-access", refresh: "new-refresh" },
    }));
    respondTo("/money", () => ({ status: 401, data: { code: "token_not_valid" } }));

    await expect(userApiClient.post("/money", { amount: 10 })).rejects.toBeDefined();

    expect(countCalls(USER_AUTH.TOKEN_REFRESH)).toBe(1);
    // The critical assertion: exactly one money POST left the device.
    expect(countCalls("/money")).toBe(1);
  });

  it("does not refresh or replay on 403 — that is a business rejection, not an expiry", async () => {
    respondTo(USER_AUTH.TOKEN_REFRESH, () => ({
      status: 200,
      data: { access: "new-access", refresh: "new-refresh" },
    }));
    respondTo("/money", () => ({ status: 403, data: { message: "Daily limit exceeded" } }));

    await expect(userApiClient.post("/money", { amount: 10 })).rejects.toBeDefined();

    expect(countCalls(USER_AUTH.TOKEN_REFRESH)).toBe(0);
    expect(countCalls("/money")).toBe(1);
  });

  it("surfaces the refreshed-but-not-replayed case with a distinguishable code", async () => {
    respondTo(USER_AUTH.TOKEN_REFRESH, () => ({
      status: 200,
      data: { access: "new-access", refresh: "new-refresh" },
    }));
    respondTo("/money", () => ({ status: 401, data: { code: "token_not_valid" } }));

    const { AUTH_REFRESHED_RETRY_REQUIRED } = require("../userApiClient");
    await expect(userApiClient.post("/money", {})).rejects.toMatchObject({
      code: AUTH_REFRESHED_RETRY_REQUIRED,
    });
  });
});
