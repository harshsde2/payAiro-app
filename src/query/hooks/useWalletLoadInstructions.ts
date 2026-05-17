import { useMutation, useQuery } from "@tanstack/react-query";
import { USER_AUTH } from "api/endpoints";
import { userApiClient } from "api/userApiClient";

export type WalletLoadInstructionsData = {
  id?: number;
  title?: string;
  step_1?: string;
  step_2?: string;
  step_3?: string;
  service_fee_note?: string;
  footer_note?: string;
};

export type WalletLoadInstructionsResponse = {
  status?: boolean;
  message?: string;
  data?: WalletLoadInstructionsData;
};

export type WalletLoadInstructionsConsentResponse = {
  status?: boolean;
  message?: string;
  data?: unknown;
};

const qk = ["walletLoadInstructions"] as const;

export function useWalletLoadInstructionsQuery(enabled: boolean) {
  return useQuery({
    queryKey: qk,
    enabled,
    queryFn: async () => {
      const raw = await userApiClient.get<WalletLoadInstructionsResponse>(
        USER_AUTH.WALLET_LOAD_INSTRUCTIONS
      );
      return raw;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useWalletLoadInstructionsConsentMutation() {
  return useMutation({
    mutationFn: async () => {
      return userApiClient.post<WalletLoadInstructionsConsentResponse>(
        USER_AUTH.WALLET_LOAD_INSTRUCTIONS_CONSENT,
        { agreed: true },
        false
      );
    },
  });
}
