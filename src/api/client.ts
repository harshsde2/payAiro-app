import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { BASE_URL, AUTH } from "./endpoints";
import { getItem, STORAGE_KEYS } from "../storage/mmkv";
import { Tokens, StandardApiResponse, ApiError } from "./types";
import { Alert } from "react-native";
import { store } from "@redux/store";
import { setErrorMsg } from "@redux/slices/authenticationSlice";

const api = axios.create({
  baseURL: BASE_URL.production,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let lastKycAlertAt = 0;
let lastKycAlertKey = "";
let kycPromptOpen = false;

const showKycAlertOnce = (
  title: string,
  msg: string,
  buttons?: Array<{ text: string; style?: any; onPress?: () => void }>,
  options?: { cancelable?: boolean }
) => {
  const now = Date.now();
  const key = `${title}|${msg}`;
  if (kycPromptOpen) return;
  if (key === lastKycAlertKey && now - lastKycAlertAt < 2000) return;
  lastKycAlertAt = now;
  lastKycAlertKey = key;
  kycPromptOpen = true;
  const wrappedButtons = (buttons || [{ text: "OK", style: "default" }]).map((b) => ({
    ...b,
    onPress: () => {
      try {
        b.onPress && b.onPress();
      } finally {
        setTimeout(() => {
          kycPromptOpen = false;
        }, 300);
      }
    },
  }));
  Alert.alert(title, msg, wrappedButtons, options);
};

const getPublicRoutes = (): string[] => {
  return [
    "auth/send-otp/",
    "auth/V1/send-otp/",
    "auth/verify/",
    "auth/V1/verify/",
    "auth/verify/sendotp/",
    "auth/verify-otp-send/",
    "auth/cybird-kyc/status/",
    "auth/cybird-kyc/",
    "auth/V1/cybird-kyc/",
    "auth/login/",
    "auth/V1/login/",
    "/auth/query/",
    "auth/query/",
    "auth/V1/update-account/",
    "wallet/details/",
    AUTH.CREATE_PIN,
  ];
};

const isPublicRoute = (url: string): boolean => {
  const publicRoutes = getPublicRoutes();
  return publicRoutes.some((route) => {
    return url === route || url === route.replace(/\/$/, "");
  });
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const tokensString = getItem(STORAGE_KEYS.AUTH_TOKENS);
      if (tokensString) {
        const tokens: Tokens = JSON.parse(tokensString);
        if (tokens.access) {
          config.headers.Authorization = `Bearer ${tokens.access}`;
        }
      }

      try {
        const { toKycMode } = require("../types/kyc");
        const state = store.getState();
        const kycStatus = state?.authenticationSlice?.kycStatus || null;
        const mode = toKycMode(kycStatus);

        const method = (config.method || "get").toLowerCase();
        const url = config.url || "";
        const isPublic = isPublicRoute(url);

        if (mode === "expired" && !isPublic) {
          const { setErrorMsg, setKycStatus } = require("@redux/slices/authenticationSlice");
          const message = "Your KYC has expired. Would you like to restart the KYC now?";
          store.dispatch(setErrorMsg(message));
          showKycAlertOnce(
            "KYC Expired",
            message,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Start KYC",
                style: "default",
                onPress: () => {
                  try {
                    const { DeviceEventEmitter } = require("react-native");
                    store.dispatch(
                      setKycStatus({
                        status: false,
                        state: "not_started",
                        toast_message: "Please start your KYC.",
                      })
                    );
                    DeviceEventEmitter.emit("NAVIGATE_TO_PERSONAL");
                  } catch (e) {}
                },
              },
            ],
            { cancelable: false }
          );
          const err = new Error("KYC_EXPIRED") as any;
          err.code = "KYC_EXPIRED";
          err.kycMode = mode;
          return Promise.reject(err);
        }

        if ((mode === "pending" || mode === "not_started") && !isPublic) {
          const mutating = method === "post" || method === "patch" || method === "delete";
          if (mutating) {
            const { setErrorMsg, setKycStatus } = require("@redux/slices/authenticationSlice");
            const msg =
              mode === "not_started"
                ? "Your KYC has not started. Please start KYC to continue."
                : "Your KYC is under review. You can browse in view-only mode.";
            store.dispatch(setErrorMsg(msg));
            const title = mode === "not_started" ? "KYC Not Started" : "KYC Under Review";
            if (mode === "not_started") {
              showKycAlertOnce(
                title,
                msg,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Start KYC",
                    style: "default",
                    onPress: () => {
                      try {
                        const { DeviceEventEmitter } = require("react-native");
                        store.dispatch(
                          setKycStatus({
                            status: false,
                            state: "not_started",
                            toast_message: msg,
                          })
                        );
                        DeviceEventEmitter.emit("NAVIGATE_TO_PERSONAL");
                      } catch (e) {}
                    },
                  },
                ],
                { cancelable: true }
              );
            } else {
              showKycAlertOnce(
                title,
                msg,
                [{ text: "OK", style: "default" }],
                { cancelable: true }
              );
            }
            const err = new Error("KYC_PENDING_VIEW_ONLY") as any;
            err.code = "KYC_PENDING_VIEW_ONLY";
            err.kycMode = mode;
            return Promise.reject(err);
          }
        }
      } catch (e) {
        console.error("KYC interceptor error:", e);
      }
    } catch (error) {
      console.error("Error in request interceptor:", error);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

const formatError = (error: AxiosError): ApiError => {
  if (error.response) {
    const response = error.response as any;
    const data = response.data || {};
    return {
      status: data.status || false,
      message: data.message || error.message || "An error occurred",
      toast_message: data.toast_message || data.message || "An error occurred",
      errors: data.errors,
      code: response.status,
    };
  } else if (error.request) {
    return {
      status: false,
      message: "Network error. Please check your connection.",
      toast_message: "Network error. Please check your connection.",
      code: "NETWORK_ERROR",
    };
  } else {
    return {
      status: false,
      message: error.message || "An unexpected error occurred",
      toast_message: error.message || "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
    };
  }
};

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const requestUrl = error.config?.url || "";
    const publicRoutes = ["auth/send-otp/", "auth/verify/"];
    const isPublicRoute = publicRoutes.some((route) => requestUrl.includes(route));

    if (error.response) {
      const { status } = error.response;

      if (status === 401 && !isPublicRoute) {
        store.dispatch(setErrorMsg("Token expired or unauthorized"));
      }

      if (status === 403 && !isPublicRoute) {
        store.dispatch(setErrorMsg("Forbidden access"));
      }

      if (status >= 500) {
        store.dispatch(setErrorMsg("Server error, please try again later"));
      }
    } else if (error.request) {
      console.log("Network error, please check your connection", requestUrl);
    }

    return Promise.reject(error);
  }
);

export const apiClient = {
  get: async <T>(url: string, config?: any): Promise<StandardApiResponse<T>> => {
    try {
      const response = await api.get<T>(url, config);
      const responseData = response.data as any;
      return {
        success: responseData?.status !== false,
        data: responseData?.data ?? responseData,
        error: null,
        statusCode: response.status,
      };
    } catch (error) {
      const apiError = formatError(error as AxiosError);
      return {
        success: false,
        data: null,
        error: apiError,
        statusCode: (error as AxiosError).response?.status || 500,
      };
    }
  },

  post: async <T>(
    url: string,
    data?: any,
    isFormData: boolean = false,
    config?: any
  ): Promise<StandardApiResponse<T>> => {
    try {
      let headers = config?.headers || {};
      if (isFormData) {
        headers = {
          ...headers,
          "Content-Type": "multipart/form-data",
        };
      }

      const response = await api.post<T>(url, data, { ...config, headers });
      const responseData = response.data as any;
      return {
        success: responseData?.status !== false,
        data: responseData?.data ?? responseData,
        error: null,
        statusCode: response.status,
      };
    } catch (error) {
      const apiError = formatError(error as AxiosError);
      return {
        success: false,
        data: null,
        error: apiError,
        statusCode: (error as AxiosError).response?.status || 500,
      };
    }
  },

  patch: async <T>(
    url: string,
    data?: any,
    isFormData: boolean = false,
    config?: any
  ): Promise<StandardApiResponse<T>> => {
    try {
      let headers = config?.headers || {};
      if (isFormData) {
        headers = {
          ...headers,
          "Content-Type": "multipart/form-data",
        };
      }

      const response = await api.patch<T>(url, data, { ...config, headers });
      const responseData = response.data as any;
      return {
        success: responseData?.status !== false,
        data: responseData?.data ?? responseData,
        error: null,
        statusCode: response.status,
      };
    } catch (error) {
      const apiError = formatError(error as AxiosError);
      return {
        success: false,
        data: null,
        error: apiError,
        statusCode: (error as AxiosError).response?.status || 500,
      };
    }
  },

  delete: async <T>(url: string, config?: any): Promise<StandardApiResponse<T>> => {
    try {
      const response = await api.delete<T>(url, config);
      const responseData = response.data as any;
      return {
        success: responseData?.status !== false,
        data: responseData?.data ?? responseData,
        error: null,
        statusCode: response.status,
      };
    } catch (error) {
      const apiError = formatError(error as AxiosError);
      return {
        success: false,
        data: null,
        error: apiError,
        statusCode: (error as AxiosError).response?.status || 500,
      };
    }
  },
};

export default api;

