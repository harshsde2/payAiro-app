import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { getItem, setItem, STORAGE_KEYS } from "../storage/mmkv";
import { Tokens } from "./types";
import { showError } from "../utils/toast";
import { EnvConfig, getUserApiBaseUrl } from "../config/env.config";
import { USER_AUTH } from "./endpoints";

// Separate Axios instance for the new FastAPI user service.
// This instance intentionally does NOT reuse the legacy KYC gating logic.
const userApi = axios.create({
  baseURL: getUserApiBaseUrl(),
  timeout: EnvConfig.API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

type RefreshBody = {
  ok?: boolean;
  data?: any;
  message?: string;
  toast_message?: string;
  /** DRF SimpleJWT / flat refresh response */
  access?: string;
  refresh?: string;
  access_token?: string;
  refresh_token?: string;
};

let refreshPromise: Promise<Tokens | null> | null = null;

const getStoredTokens = (): Partial<Tokens> | null => {
  try {
    const tokensString = getItem(STORAGE_KEYS.AUTH_TOKENS);
    if (!tokensString) return null;
    return JSON.parse(tokensString) as Partial<Tokens>;
  } catch {
    return null;
  }
};

/** Merge access/refresh into MMKV without dropping extra fields (e.g. step, username). */
const persistTokensMerged = (tokens: Tokens) => {
  try {
    const existing = getStoredTokens() ?? {};
    setItem(
      STORAGE_KEYS.AUTH_TOKENS,
      JSON.stringify({ ...existing, ...tokens })
    );
  } catch {
    // ignore storage write failures; requests will likely fail and user will re-auth
  }
};

const readAccessRefresh = (
  source: Record<string, unknown> | null | undefined
): { access?: string; refresh?: string } => {
  if (!source) return {};
  const access = source.access ?? source.access_token;
  const refresh = source.refresh ?? source.refresh_token;
  return {
    access: typeof access === "string" ? access : undefined,
    refresh: typeof refresh === "string" ? refresh : undefined,
  };
};

const extractTokensFromRefreshResponse = (
  body: RefreshBody,
  fallbackRefresh?: string | null
): Tokens | null => {
  if (body?.ok === false) return null;

  const raw =
    body?.data?.tokens ??
    body?.data?.token ??
    body?.data?.data?.tokens ??
    body?.data;

  let access: string | undefined;
  let refreshFromBody: string | undefined;

  if (typeof raw === "string") {
    access = raw;
  } else if (raw && typeof raw === "object") {
    const parsed = readAccessRefresh(raw as Record<string, unknown>);
    access = parsed.access;
    refreshFromBody = parsed.refresh;
  }

  // Flat DRF SimpleJWT: { access } or wrapped OTP-style at top level
  if (!access) {
    const top = readAccessRefresh(body as Record<string, unknown>);
    access = top.access;
    refreshFromBody = refreshFromBody ?? top.refresh;
  }

  const refresh =
    refreshFromBody ??
    (typeof fallbackRefresh === "string" ? fallbackRefresh : undefined);

  if (typeof access === "string" && typeof refresh === "string") {
    return { access, refresh };
  }
  return null;
};

const refreshAccessToken = async (): Promise<Tokens | null> => {
  const stored = getStoredTokens();
  const refreshToken = stored?.refresh;
  if (!refreshToken) return null;

  // Reuse the same Axios instance but do NOT attach bearer token for this route
  // (it is included in `publicAuthRoutes` below).
  const resp = await userApi.post<RefreshBody>(USER_AUTH.TOKEN_REFRESH, {
    // backend naming differs across services; send both keys safely
    refresh: refreshToken,
    refresh_token: refreshToken,
  });

  if (__DEV__ && EnvConfig.ENABLE_LOGGING) {
    const d = resp.data?.data;
    const t = d?.tokens ?? d?.token ?? d;
    const tokenObj = t && typeof t === "object" ? t : null;
    const flat = readAccessRefresh(resp.data as Record<string, unknown>);
    console.log("[UserAPI][TokenRefresh]", {
      ok: resp.data?.ok,
      accessInBody: !!(
        flat.access ||
        (tokenObj && ("access" in tokenObj || "access_token" in tokenObj)) ||
        typeof t === "string"
      ),
      refreshInBody: !!(
        flat.refresh ||
        (tokenObj &&
          ("refresh" in tokenObj || "refresh_token" in tokenObj))
      ),
    });
  }

  if (resp.data?.ok === false) return null;

  const newTokens = extractTokensFromRefreshResponse(
    resp.data,
    refreshToken
  );
  if (!newTokens?.access || !newTokens?.refresh) return null;
  persistTokensMerged(newTokens);
  return newTokens;
};

// Add bearer token from MMKV (used by profile/me endpoints).
userApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const requestPath = config.url || "";
      const publicAuthRoutes = [
        USER_AUTH.OTP_REQUEST,
        USER_AUTH.OTP_VERIFY,
        USER_AUTH.TOKEN_REFRESH,
      ];
      const isPublicAuthRoute = publicAuthRoutes.some((route) => {
        return (
          requestPath === route ||
          requestPath === route.replace(/\/$/, "")
        );
      });

      const tokensString = getItem(STORAGE_KEYS.AUTH_TOKENS);
      if (tokensString && !isPublicAuthRoute) {
        const tokens: Partial<Tokens> = JSON.parse(tokensString);
        if (tokens.access) {
          config.headers = config.headers || {};
          (config.headers as any).Authorization = `Bearer ${tokens.access}`;
        }
      }
    } catch (e) {
      // If token parsing fails, let the request proceed (backend will reject).
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Minimal error handling (avoid breaking React Query flows).
userApi.interceptors.response.use(
  (response: AxiosResponse) => {
    if (__DEV__ && EnvConfig.ENABLE_LOGGING) {
      try {
        const fullUrl = axios.getUri(response.config);
        console.log("[UserAPI]", fullUrl, response.status, response.data);
      } catch {
        // ignore debug log failures
      }
    }
    return response;
  },
  async (error: AxiosError) => {
    if (__DEV__ && EnvConfig.ENABLE_LOGGING && error.config) {
      try {
        const fullUrl = axios.getUri(error.config);
        console.log(
          "[UserAPI]",
          fullUrl,
          error.response?.status,
          error.response?.data ?? error.message
        );
      } catch {
        // ignore debug log failures
      }
    }

    const status = error.response?.status;
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // If unauthorized / forbidden (expired token), attempt refresh + retry once.
    if (
      (status === 401 || status === 403) &&
      originalRequest &&
      !originalRequest._retry &&
      typeof originalRequest.url === "string"
    ) {
      const requestPath = originalRequest.url || "";
      const isRefreshRoute =
        requestPath === USER_AUTH.TOKEN_REFRESH ||
        requestPath === USER_AUTH.TOKEN_REFRESH.replace(/\/$/, "");

      if (!isRefreshRoute) {
        originalRequest._retry = true;
        try {
          if (!refreshPromise) {
            refreshPromise = refreshAccessToken().finally(() => {
              refreshPromise = null;
            });
          }

          const newTokens = await refreshPromise;
          if (newTokens?.access) {
            originalRequest.headers = originalRequest.headers || {};
            (originalRequest.headers as any).Authorization = `Bearer ${newTokens.access}`;
            return userApi.request(originalRequest);
          }
        } catch {
          // fall through to showError below
        }
      }

      // If refresh fails, surface a single user-facing message.
      showError("Session expired. Please login again.");
    }

    return Promise.reject(error);
  }
);

export const userApiClient = {
  get: async <T>(url: string): Promise<T> => {
    const response = await userApi.get<T>(url);
    return response.data;
  },

  post: async <T>(
    url: string,
    data: any,
    isFormData: boolean = false,
    extraHeaders: Record<string, string> = {}
  ): Promise<T> => {
    const headers = isFormData
      ? { ...extraHeaders, "Content-Type": "multipart/form-data" }
      : extraHeaders;
    const response = await userApi.post<T>(url, data, { headers });
    return response.data;
  },

  patch: async <T>(
    url: string,
    data: any,
    isFormData: boolean = false
  ): Promise<T> => {
    const headers = isFormData ? { "Content-Type": "multipart/form-data" } : {};
    const response = await userApi.patch<T>(url, data, { headers });
    return response.data;
  },

  delete: async <T>(url: string): Promise<T> => {
    const response = await userApi.delete<T>(url);
    return response.data;
  },
};

export default userApi;

