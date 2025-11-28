import { useGet, usePost, usePatch } from "@api/hooks";
import { AUTH } from "@api/endpoints";
import { queryKeys } from "@query/queryKeys";
import { queryStaleTime } from "@query/queryConfigs";
import { User } from "@api/types";
import { useQueryClient } from "@tanstack/react-query";

interface VerifyUserPayload {
  identifier_type: "username" | "email" | "phone";
  identifier_value: string;
}

interface VerifyUserByIdentifierPayload {
  identifier: string;
}

interface AddContactPayload {
  identifier_type: "username" | "email" | "phone";
  identifier_value: string;
  nickname?: string;
}

export const useContacts = () => {
  return useGet<User[]>({
    queryKey: queryKeys.user.contacts(),
    endpoint: AUTH.CONTACT_GET,
  });
};

export const useVerifyUser = () => {
  return usePost<User, VerifyUserPayload>({
    endpoint: AUTH.VERIFY_USER,
    isFormData: true,
  });
};

export const useVerifyUserByIdentifier = () => {
  return usePost<User, VerifyUserByIdentifierPayload>({
    endpoint: AUTH.VERIFY_USER,
    isFormData: true,
  });
};

export const useAddContact = () => {
  const queryClient = useQueryClient();
  return usePost<any, AddContactPayload>({
    endpoint: AUTH.CONTACT_ADDING,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.contacts() });
    },
  });
};

export const useChangePin = () => {
  return usePatch<any, AddContactPayload>({
    endpoint: AUTH.CHANGE_PIN,
    isFormData: true,
  });
};

export const useVerifyUserForChangePin = () => {
  return usePost<any, void>({
    endpoint: AUTH.VERIFY_OTP_WITH_MAIL,
  });
};

export const useVerifyUserForChangePinOtp = () => {
  return usePost<any, AddContactPayload>({
    endpoint: AUTH.VERIFY_SEND_OTP,
    isFormData: true,
  });
};

export const useIntraAccountTransfer = () => {
  return usePost<any>({
    endpoint: AUTH.SELF_TRANSFER,
    isFormData: true,
  });
};

export const useUserToUserTransfer = () => {
  return usePost<any>({
    endpoint: AUTH.USER_TO_USER_CYBRID_TRANSFER,
    isFormData: true,
  });
};

export const useSupport = () => {
  return usePost<any>({
    endpoint: AUTH.USER_SUPPORT,
    isFormData: true,
  });
};

export const useNotifications = () => {
  return useGet<any>({
    queryKey: queryKeys.user.notifications(),
    endpoint: AUTH.NOTIFICATIONS,
  });
};

export const useUserPin = (enabled = true) => {
  return useGet<any>({
    queryKey: queryKeys.user.pin(),
    endpoint: AUTH.GET_PIN,
    enabled,
    staleTime: queryStaleTime.INSTANT_STALE_TIME,
  });
};

export const useDashBoardFiatData = (enabled = true) => {
  return useGet<any>({
    queryKey: queryKeys.user.fiatDashboard(),
    endpoint: AUTH.GET_FIAT_DASHBOARD_DATA,
    enabled,
    staleTime: queryStaleTime.INSTANT_STALE_TIME,
  });
};

export const useWalletDashboardData = (enabled = true) => {
  return useGet<any>({
    queryKey: queryKeys.user.walletDashboard(),
    endpoint: AUTH.GET_WALLET_DASHBOARD_DATA,
    enabled,
    staleTime: queryStaleTime.INSTANT_STALE_TIME,
  });
};
