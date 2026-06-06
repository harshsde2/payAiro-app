import {
  useMutation,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "api";
import { USER_AUTH, AUTH, KYC } from "api/endpoints";
import { ApiResponse, IContentDataResponse } from "api/types";
import { userApiClient } from "api/userApiClient";
import useDispatchAction from "hooks/useDispatchAction";
import { setKycStatus } from "redux/slices/newBackendAuthSlice";
import { showError, showSuccess } from "../../utils/toast";
import { queryStaleTime } from "query/queryConfigs";

const mapFastApiOkResponseToApiResponse = (
  body: any
): ApiResponse<any> => ({
  status: !!body?.ok,
  data: body?.data,
  message: body?.message || "",
  toast_message: body?.message || body?.toast_message || "",
});

const mapFastApiOtpVerifyToApiResponse = (body: any): ApiResponse<any> => {
  const tokens = body?.data?.tokens ?? {};
  const stepCount =
    body?.data?.step_count ??
    body?.data?.step ??
    body?.data?.onboarding_step_count ??
    undefined;

  return {
    status: !!body?.ok,
    data: {
      access: tokens?.access,
      refresh: tokens?.refresh,
      step: stepCount,
      username: body?.data?.username,
    },
    message: body?.message || "",
    toast_message: body?.message || body?.toast_message || "",
  };
};

const mapOtpRequestPayload = (payload: any) => {
  const phoneCountryCode = 1;

  let body: Record<string, any>;

  if (payload?.phone) {
    body = {
      channel: "phone",
      phone_country_code: phoneCountryCode,
      phone_national_number: String(payload.phone),
    };
  } else if (payload?.email) {
    body = {
      channel: "email",
      email: String(payload.email).trim().toLowerCase(),
    };
  } else {
    body = {
      channel: "email",
      email: String(payload?.email || "").trim().toLowerCase(),
    };
  }

  const ref = payload?.ref_code != null ? String(payload.ref_code).trim() : "";
  if (ref) {
    body.ref_code = ref;
  }
  if (payload?.hash) {
    body.hash = String(payload.hash);
  }
  if (payload?.location) {
    body.location = payload.location;
  }

  return body;
};

const mapProfileUpdatePayloadToFormData = (payload: any) => {
  const form = new FormData();

  const firstName = payload?.first_name ?? payload?.name ?? payload?.firstName;
  const lastName =
    payload?.last_name ?? payload?.lastname ?? payload?.lastName;
  const email = payload?.email;
  const payairoName =
    payload?.payairo_name ??
    payload?.usernames ??
    payload?.username;

  if (firstName) form.append("first_name", String(firstName));
  if (lastName) form.append("last_name", String(lastName));
  if (email) form.append("email", String(email));
  if (payairoName != null && String(payairoName).trim() !== "") {
    form.append("payairo_name", String(payairoName).trim());
  }

  const dob = payload?.dob ?? payload?.date_of_birth;
  if (dob) form.append("dob", String(dob));

  const ssn = payload?.ssn;
  if (ssn) form.append("ssn", String(ssn));

  // KYCScreen currently doesn't provide image; keep support for future.
  if (payload?.image) {
    form.append("image", payload.image);
  }

  return form;
};

export const useLogin = () => {
  return useMutation<ApiResponse<any>, Error>({
    mutationFn: async (payload) => {
        console.log("payload =>", JSON.stringify(payload, null, 2));
      return apiClient.post<ApiResponse<any>>(AUTH.LOGIN, payload, true);
    },
    onSuccess: (data) => {
      // console.log("data =>", JSON.stringify(data, null, 2));
    },
    onError: (error) => {
      console.log("error =>", JSON.stringify(error, null, 2));
    },
  });
};

export const useSignUp = () => {
  return useMutation<ApiResponse<any>, Error>({
    mutationFn: async (payload) => {
      console.log("payload =>", JSON.stringify(payload, null, 2));
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
    onError: (error) => {
      console.log("error =>", JSON.stringify(error, null, 2));
    },
    onSuccess: (data) => {
      // console.log("data =>", JSON.stringify(data, null, 2));
    },
  });
};

// =============================
// FastAPI user auth/profile
// =============================

export const useUserOtpRequest = () => {
  return useMutation<ApiResponse<any>, Error, any>({
    mutationFn: async (payload) => {
      const body = mapOtpRequestPayload(payload);
      const resp = await userApiClient.post<any>(
        USER_AUTH.OTP_REQUEST,
        body,
        false
      );
      return mapFastApiOkResponseToApiResponse(resp);
    },
  });
};

export const useUserOtpVerify = () => {
  return useMutation<ApiResponse<any>, Error, any>({
    mutationFn: async (payload) => {
      // console.log("payload =>", JSON.stringify(payload, null, 2));
      const resp = await userApiClient.post<any>(
        USER_AUTH.OTP_VERIFY,
        payload,
        false
      );
      return mapFastApiOtpVerifyToApiResponse(resp);
    },
  });
};

export const useUserProfileUpdate = () => {
  return useMutation<ApiResponse<any>, Error, any>({
    mutationFn: async (payload) => {
      const form = mapProfileUpdatePayloadToFormData(payload);
      const resp = await userApiClient.post<any>(
        USER_AUTH.PROFILE_UPDATE,
        form,
        true
      );
      return mapFastApiOkResponseToApiResponse(resp);
    },
  });
};

export type UserKycCompletePayload = {
  payairo_name: string;
  email: string;
  first_name: string;
  last_name: string;
  ssn_last_four: string;
};

export const useUserKycComplete = () => {
  return useMutation<ApiResponse<any>, Error, UserKycCompletePayload>({
    mutationFn: async (payload) => {
      const resp = await userApiClient.post<any>(
        USER_AUTH.KYC_COMPLETE,
        payload,
        false
      );
      return mapFastApiOkResponseToApiResponse(resp);
    },
  });
};

export const useUserAddressUpdate = () => {
  return useMutation<ApiResponse<any>, Error, any>({
    mutationFn: async (payload) => {
      const resp = await userApiClient.post<any>(
        USER_AUTH.ADDRESS_UPDATE,
        payload,
        false
      );
      return mapFastApiOkResponseToApiResponse(resp);
    },
  });
};

export const useUserMe = () => {
  return useMutation<ApiResponse<any>, Error>({
    mutationFn: async () => {
      const resp = await userApiClient.get<any>(USER_AUTH.USERS_ME);
      return mapFastApiOkResponseToApiResponse(resp);
    },
  });
};

export type CoinmeMobileAuthApiBody = Record<string, unknown>;

export const useCoinmeMobileAuthRequest = () => {
  return useMutation<any, Error, CoinmeMobileAuthApiBody>({
    mutationFn: async (body) => {
      return userApiClient.post<any>(
        USER_AUTH.COINME_2FA_MOBILE_AUTH,
        body,
        false
      );
    },
  });
};

export const useCoinmeInstantLinkRequest = () => {
  return useMutation<any, Error, CoinmeMobileAuthApiBody>({
    mutationFn: async (body) => {
      return userApiClient.post<any>(
        USER_AUTH.COINME_2FA_INSTANT_LINK,
        body,
        false
      );
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
      console.log("payload 2 =>", JSON.stringify(payload,null,2));
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
      // console.log("on data =>", data);
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

// Check KYC status (GET) and surface via Redux toast/messages
export const useKYCStatus = () => {
  return useMutation<ApiResponse<any>, Error>({
    mutationFn: async () => {
      const data = apiClient.post<ApiResponse<any>>(AUTH.CYBIRD_KYC_STATUS,false);
      return data;
    },
    onSuccess: (data: any) => {
      const status = data?.status ?? data?.data?.status;
      const toast = data?.toast_message ?? data?.data?.toast_message ?? data?.message ?? data?.data?.message;
      // persist full object in redux
      useDispatchAction(setKycStatus(data?.data ?? data));
      if (status === false) {
        showError(toast || "KYC status: not completed");
      } else {
        showSuccess(toast || "KYC status completed");
      }
    },
    onError: (error: any) => {
      const toast = error?.response?.data?.toast_message || error?.response?.data?.message || "Failed to fetch KYC status";
      // set the raw error payload as kycStatus if available
      if (error?.response?.data) {
        useDispatchAction(setKycStatus(error.response.data));
      }
      showError(toast);
    },
  });
};

export const useSendOTP = () => {
  return useMutation<ApiResponse<any>, Error>({
    mutationFn: async (payload) => {
      console.log("payload =>", JSON.stringify(payload, null, 2));
      const data = apiClient.post<ApiResponse<any>>(AUTH.SEND_OTP_FOR_TRANSACTION, payload, false);
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

/**
 * Hook to get content data
 */
export const useContentData = () => {
  return useQuery<ApiResponse<IContentDataResponse>>({
    queryKey: ["contentData"],
    queryFn: async () => {
      return await apiClient.get<ApiResponse<IContentDataResponse>>(AUTH.CONTENT_DATA);
    },
    
  });
};
