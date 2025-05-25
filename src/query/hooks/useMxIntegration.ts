import { useMutation } from "@tanstack/react-query";
import { apiClient } from "api";
import { AUTH } from "api/endpoints";
import { ApiResponse } from "api/types";

interface MxCreateMemberPayload {
  memberGuid: string;
}
interface MxLinkExternalAccountPayload {
  financialAccountId: string;
}
export interface MxRegisterExternalAccounttPayload {
  bank_name: string,
  account_number: string,
  account_id: string,
  financialInstitutionName: string,
  account_type: string,
  small_logo_url: string,
  medium_logo_url: string,
  account_onwer: string,
}

export const useMxCreateMember = () => {
  return useMutation<ApiResponse<any>, Error, MxCreateMemberPayload>({
    mutationFn: async (payload) => {
      return apiClient.post<ApiResponse<any>>(AUTH.MX_CREATE_MEMBER, payload, true);
    },
    onSuccess: (data) => {
      console.log('Mutation success useMxCreateMember:', data);
    },
    onError: (error: any) => {
      console.error('Failed to create member:', error || error.message);
    },
  });
};

export const useMxAccountDetailsExternal = () => {
  return useMutation<ApiResponse<any>, Error>({
    mutationFn: async () => {
      return apiClient.post<ApiResponse<any>>(AUTH.MX_ACCOUNT_DETAILS_EXTERNAL, false);
    },
    onSuccess: (data) => {
      // console.log('Mutation success useMxAccountDetailsExternal:', data);
    },
    onError: (error: any) => {
      // console.error('Failed to useMxAccountDetailsExternal', error|| error.message);
    },
  });
};

export const useMxLinkExternalAccount = () => {
  return useMutation<ApiResponse<any>, Error, MxLinkExternalAccountPayload>({
    mutationFn: async (payload) => {
      console.log('Payload useMxLinkExternalAccount:', payload);
      return apiClient.post<ApiResponse<any>>(AUTH.MX_LINK_EXTERNAL_ACCOUNT, payload, true);
    },
    onSuccess: (data) => {
      console.log('Mutation success useMxLinkExternalAccount:', data);
    },
    onError: (error: any) => {
      // console.error('Failed to useMxLinkExternalAccount:', error|| error.message);
    },
  });
};
export const useMxRegisterExternalAccount = () => {
  return useMutation<ApiResponse<any>, Error, MxRegisterExternalAccounttPayload>({
    mutationFn: async (payload) => {
      console.log('Payload useMxRegisterExternalAccount:', payload);
      return apiClient.post<ApiResponse<any>>(AUTH.MX_REGISTER_EXTERNAL_ACCOUNT, payload, true);
    },
    onSuccess: (data) => {
      console.log('Mutation success useMxRegisterExternalAccount:', data);
    },
    onError: (error: any) => {
      console.error('Failed to useMxRegisterExternalAccount:', error|| error.message);
    },
  });
};


