import {
  useMutation,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "api";
import { AUTH, KYC } from "api/endpoints";
import { ApiResponse } from "api/types";

export const useLogin = () => {
  return useMutation<ApiResponse<any>, Error>({
    mutationFn: async (payload) => {
      return apiClient.post<ApiResponse<any>>(AUTH.LOGIN, payload, true);
    },
  });
};

export const useSignUp = () => {
  return useMutation<ApiResponse<any>, Error>({
    mutationFn: async (payload) => {
      return apiClient.post<ApiResponse<any>>(AUTH.SEND_OTP, payload, true);
    },
  });
};

export const useVerifyOTP = () => {
  return useMutation<ApiResponse<any>, Error>({
    mutationFn: async (payload) => {
      console.log("paylaod =>", payload);
      const data = apiClient.post<ApiResponse<any>>(AUTH.VERIFY, payload, true);
      return data;
    },
  });
};

export const useStepCount = () => {
  return useMutation<ApiResponse<any>, Error>({
    mutationFn: async (payload) => {
      console.log("paylaod =>", payload);
      const data = apiClient.patch<ApiResponse<any>>(
        AUTH.STEP_COUNT,
        payload,
        true
      );
      return data;
    },
  });
};

export const usePatchUserDetails = () => {
  return useMutation<ApiResponse<any>, Error>({
    mutationFn: async (payload) => {
      const data = apiClient.patch<ApiResponse<any>>(
        AUTH.UPDATE_ACCOUNT,
        payload,
        true
      );
      return data;
    },
  });
};

export const useSubmitKYC = () => {
  return useMutation<ApiResponse<any>, Error>({
    mutationFn: async (payload) => {
      // console.log(JSON.stringify(payload, null, 2));
      const data = apiClient.patch<ApiResponse<any>>(
        KYC.SUBMISSION,
        payload,
        true
      );
      return data;
    },
    onError: (error: any) => {
      console.log("error =>", JSON.stringify(error, null, 2));
    },
    onSuccess(data, variables, context) {
      console.log("on data =>", data);
    },
  });
};

export const useCreatePin = () => {
  return useMutation<ApiResponse<any>, Error>({
    mutationFn: async (payload) => {
      const data = apiClient.post<ApiResponse<any>>(
        AUTH.CREATE_PIN,
        payload,
        true
      );
      return data;
    },
  });
};

export const useAddBankAccount = () => {
  return useMutation<ApiResponse<any>, Error>({
    mutationFn: async () => {
      const data = apiClient.post<ApiResponse<any>>(
        AUTH.ADD_NORMAL_BANK_ACCOUNT,
        {},
        false
      );
      return data;
    },
  });
};

export const useAddTraditionalIRABankAccount = () => {
  return useMutation<ApiResponse<any>, Error>({
    mutationFn: async (payload) => {
      const data = apiClient.post<ApiResponse<any>>(
        AUTH.ADD_TRADITIONAL_IRA_BANK_ACCOUNT,
        payload,
        true
      );
      return data;
    },
  });
};

export const useKYCCompleted = () => {
  return useMutation<ApiResponse<any>, Error>({
    mutationFn: async () => {
      const data = apiClient.post<ApiResponse<any>>(AUTH.CYBIRD_KYC, {}, false);
      return data;
    },
  });
};

export const useSendOTP = () => {
  return useMutation<ApiResponse<any>, Error>({
    mutationFn: async () => {
      const data = apiClient.post<ApiResponse<any>>(AUTH.SEND_OTP_FOR_TRANSACTION, {}, false);
      return data;
    },
    onSuccess: (data) => {
      console.log(" otp response =>", JSON.stringify(data,null,2));
    },
    onError: (error) => {
      console.log("otp error =>", error);
    },
  });
};

export const useVerifyUserForSendOTP = () => {
  return useMutation<ApiResponse<any>, Error>({
    mutationFn: async (payload) => {
      const data = apiClient.post<ApiResponse<any>>(AUTH.VERIFY_USER_FOR_SEND_OTP, payload, false);
      return data;
    },
  });
};
