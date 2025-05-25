import { useMutation } from "@tanstack/react-query";
import { apiClient } from "api";
import { AUTH, KYC } from "api/endpoints";
import { ApiResponse } from "api/types";
import { queryClient } from "query/queryClient";

export const useLogin = () => {
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
      const data = apiClient.post<ApiResponse<any>>(
        KYC.SUBMISSION,
        payload,
        true
      );
      return data;
    },
    onError: (error) => {
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
