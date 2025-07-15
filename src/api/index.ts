import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { AUTH, BASE_URL } from "./endpoints";
import { getItem, STORAGE_KEYS } from "../storage/mmkv";
import { Tokens } from "./types";
import { Platform } from "react-native";
import { stat } from "react-native-fs";
import useDispatchAction from "hooks/useDispatchAction";
import { setErrorMsg } from "redux/slices/authenticationSlice";

// Create Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
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
