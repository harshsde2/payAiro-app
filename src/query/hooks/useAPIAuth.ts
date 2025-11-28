import { usePost, usePatch } from "@api/hooks";
import { AUTH, KYC } from "@api/endpoints";
import { setErrorMsg, setSuccessMsg, setKycStatus } from "@redux/slices/authenticationSlice";
import { store } from "@redux/store";

interface LoginPayload {
  email?: string;
  phone?: string;
  otp?: string;
  [key: string]: any;
}

interface VerifyOTPPayload {
  email?: string;
  phone?: string;
  otp: string;
  [key: string]: any;
}

interface StepCountPayload {
  step: number;
  [key: string]: any;
}

interface UpdateAccountPayload {
  [key: string]: any;
}

interface KYCPayload {
  [key: string]: any;
}

interface CreatePinPayload {
  pin: string;
  [key: string]: any;
}

interface TraditionalIRAPayload {
  [key: string]: any;
}

interface VerifyUserForSendOTPPayload {
  [key: string]: any;
}

export const useLogin = () => {
  return usePost<any, LoginPayload>({
    endpoint: AUTH.LOGIN,
    isFormData: true,
  });
};

export const useSignUp = () => {
  return usePost<any, LoginPayload>({
    endpoint: AUTH.SEND_OTP,
    isFormData: true,
  });
};

export const useVerifyOTP = () => {
  return usePost<any, VerifyOTPPayload>({
    endpoint: AUTH.VERIFY,
    isFormData: true,
  });
};

export const useStepCount = () => {
  return usePatch<any, StepCountPayload>({
    endpoint: AUTH.STEP_COUNT,
    isFormData: true,
  });
};

export const usePatchUserDetails = () => {
  return usePatch<any, UpdateAccountPayload>({
    endpoint: AUTH.UPDATE_ACCOUNT,
    isFormData: true,
  });
};

export const useSubmitKYC = () => {
  return usePatch<any, KYCPayload>({
    endpoint: KYC.SUBMISSION,
    isFormData: true,
  });
};

export const useCreatePin = () => {
  return usePost<any, CreatePinPayload>({
    endpoint: AUTH.CREATE_PIN,
    isFormData: true,
  });
};

export const useAddBankAccount = () => {
  return usePost<any, void>({
    endpoint: AUTH.ADD_NORMAL_BANK_ACCOUNT,
  });
};

export const useAddTraditionalIRABankAccount = () => {
  return usePost<any, TraditionalIRAPayload>({
    endpoint: AUTH.ADD_TRADITIONAL_IRA_BANK_ACCOUNT,
    isFormData: true,
  });
};

export const useKYCCompleted = () => {
  return usePost<any, void>({
    endpoint: AUTH.CYBIRD_KYC,
  });
};

export const useKYCStatus = () => {
  return usePost<any, void>({
    endpoint: AUTH.CYBIRD_KYC_STATUS,
    onSuccess: (data) => {
      const responseData = data.data || data;
      const status = responseData?.status ?? responseData?.data?.status;
      const toast = responseData?.toast_message ?? responseData?.data?.toast_message ?? responseData?.message ?? responseData?.data?.message;
      const kycData = responseData?.data ?? responseData;
      store.dispatch(setKycStatus(kycData));
      if (status === false) {
        store.dispatch(setErrorMsg(toast || "KYC status: not completed"));
      } else {
        store.dispatch(setSuccessMsg(toast || "KYC status completed"));
      }
    },
    onError: (error) => {
      const toast = error.error?.toast_message || error.error?.message || "Failed to fetch KYC status";
      if (error.error) {
        store.dispatch(setKycStatus(error.error as any));
      }
      store.dispatch(setErrorMsg(toast));
    },
  });
};

export const useSendOTP = () => {
  return usePost<any, void>({
    endpoint: AUTH.SEND_OTP_FOR_TRANSACTION,
  });
};

export const useVerifyUserForSendOTP = () => {
  return usePost<any, VerifyUserForSendOTPPayload>({
    endpoint: AUTH.VERIFY_USER_FOR_SEND_OTP,
  });
};
