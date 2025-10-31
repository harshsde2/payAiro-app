import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { AUTH, BASE_URL } from "./endpoints";
import { getItem, STORAGE_KEYS } from "../storage/mmkv";
import { Tokens } from "./types";
import { Platform, Alert } from "react-native";
import { stat } from "react-native-fs";
import useDispatchAction from "hooks/useDispatchAction";
import { setErrorMsg } from "redux/slices/authenticationSlice";

// Create Axios instance
const api = axios.create({
  baseURL: BASE_URL.production,
  timeout: Infinity,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const tokensString = getItem(STORAGE_KEYS.AUTH_TOKENS);
      if (tokensString) {
        const tokens: Tokens = JSON.parse(tokensString);
        // console.log('[MMKV] iOS parsed access token:', tokens.access); // <== ADD THIS

        if (tokens.access) {
          config.headers.Authorization = `Bearer ${tokens.access}`;
        }
      }

      // KYC gating
      try {
        const { store } = require("../redux/store");
        const { toKycMode } = require("../types/kyc");
        const state = store.getState();
        const kycStatus = state?.authenticationSlice?.kycStatus || null;
        const mode = toKycMode(kycStatus);

        const method = (config.method || "get").toLowerCase();
        const url = config.url || "";

        // Robust allow-list of absolutely public routes
        // Note: we use === for exact match, not partial includes. Adjust if server might return with/without trailing slash.
        const publicRoutes = [
          "auth/send-otp/",
          "auth/V1/send-otp/",
          "auth/verify/",
          "auth/V1/verify/",
          "auth/verify/sendotp/",
          "auth/verify-otp-send/",
          "auth/cybird-kyc/status/", // allow KYC status polling even in view-only mode
          "auth/cybird-kyc/",
          "auth/V1/cybird-kyc/",
          "auth/login/",
          "auth/V1/login/",
          "/auth/query/", // USER_SUPPORT: allow users to submit support requests even when KYC is pending
          "auth/query/", // without leading slash variant
        ];
        // Find ONLY if route exactly matches (with or without a trailing slash for safety)
        const isPublic = publicRoutes.some((route) => {
          return url === route || url === route.replace(/\/$/, "");
        });

        console.log("[KYC] Interceptor: method =>", method);
        console.log("[KYC] Interceptor: url =>", url);
        console.log("[KYC] Interceptor: mode =>", mode, ", isPublic =>", isPublic);

        if (mode === "expired" && !isPublic) {
          const { resetState, setErrorMsg } = require("../redux/slices/authenticationSlice");
          const message = "Your KYC status is expired. Please log in again.";
          useDispatchAction(setErrorMsg(message));
          Alert.alert("Session Expired", message);
          useDispatchAction(resetState());
          const err = new Error("KYC_EXPIRED") as any;
          err.code = "KYC_EXPIRED";
          err.kycMode = mode;
          console.log("[KYC] BLOCKED request (expired):", method, url);
          return Promise.reject(err);
        }

        if (mode === "pending" && !isPublic) {
          const mutating = method === "post" || method === "patch" || method === "delete";
          if (mutating) {
            const { setErrorMsg } = require("../redux/slices/authenticationSlice");
            const msg = "Your KYC is under review. You can browse in view-only mode.";
            useDispatchAction(setErrorMsg(msg));
            Alert.alert("KYC Under Review", msg);
            const err = new Error("KYC_PENDING_VIEW_ONLY") as any;
            err.code = "KYC_PENDING_VIEW_ONLY";
            err.kycMode = mode;
            console.log("[KYC] BLOCKED request (pending):", method, url);
            return Promise.reject(err);
          }
        }
        if (isPublic) {
          console.log("[KYC] ALLOWED public request:", method, url);
        } else {
          console.log("[KYC] ALLOWED non-mutating or approved:", method, url);
        }
      } catch (e) {
        // swallow gating error
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

// Response interceptor for handling errors
// api.interceptors.response.use(
//   (response: AxiosResponse) => {
//     return response;
//   },
//   async (error: AxiosError) => {
//     // Handle error responses
//     if (error.response) {
//       const { status } = error.response;

//       // Handle 401 Unauthorized errors (token expired)
//       if (status === 401) {
//         // Here you could implement token refresh logic
//         console.log("Token expired or unauthorized");

//         useDispatchAction(setErrorMsg("Token expired or unauthorized"));
//         // For now, we'll just log the error
//         // In a real implementation, you would refresh the token
//       }

//       // Handle 403 Forbidden errors
//       if (status === 403) {
//         console.log("Forbidden access");
//         useDispatchAction(setErrorMsg("Forbidden access"));
//       }

//       // Handle 500 Server errors
//       if (status >= 500) {
//         console.log("Server error, please try again later");
//         useDispatchAction(setErrorMsg("Server error, please try again later"));
//       }
//     } else if (error.request) {
//       // The request was made but no response was received
//       console.log("Network error, please check your connection");
//     } else {
//       // Something happened in setting up the request
//       console.log("Error", error.message);
//     }

//     return Promise.reject(error);
//   }
// );
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const requestUrl = error.config?.url || "";

    // Define public routes (skip logging these)
    const publicRoutes = ["auth/send-otp/", "auth/verify/"];

    const isPublicRoute = publicRoutes.some((route) =>
      requestUrl.includes(route)
    );

    if (error.response) {
      const { status } = error.response;

      // console.log("requestUrl=>", requestUrl);
      // Only show this if NOT a public route
      if (status === 401 && !isPublicRoute) {
        // console.log("Token expired or unauthorized");
        useDispatchAction(setErrorMsg("Token expired or unauthorized"));
      }

      if (status === 403 && !isPublicRoute) {
        // console.log("Forbidden access");
        useDispatchAction(setErrorMsg("Forbidden access"));
      }

      if (status >= 500) {
        throw error.response;
        // console.log("Server error, please try again later", requestUrl);
        // useDispatchAction(
        //   setErrorMsg("Something went wrong, please try again later")
        // );
      }
    } else if (error.request) {
      console.log("Network error, please check your connection", requestUrl);
    } else {
      throw error.response;
      // throw error.response;
      console.log("Error", error.message);
    }
    // If the request URL matches a specific endpoint, handle it
    return Promise.reject(error);
  }
);

// Helper methods for API calls
export const apiClient = {
  get: async <T>(url: string): Promise<T> => {
    const response = await api.get<T>(url);
    return response.data;
  },

  post: async <T>(
    url: string,
    data: any,
    isFormData: boolean = false
  ): Promise<T> => {
    let headers = {};
    if (isFormData) {
      headers = {
        "Content-Type": "multipart/form-data",
      };
    }

    const response = await api.post<T>(url, data, { headers });
    return response.data;
  },

  patch: async <T>(
    url: string,
    data: any,
    isFormData: boolean = false
  ): Promise<T> => {
    let headers = {};
    if (isFormData) {
      headers = {
        "Content-Type": "multipart/form-data",
      };
    }

    const response = await api.patch<T>(url, data, { headers });
    return response.data;
  },

  delete: async <T>(url: string): Promise<T> => {
    const response = await api.delete<T>(url);
    return response.data;
  },
};

export default api;
