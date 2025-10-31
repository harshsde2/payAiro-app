import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "api";
import { AUTH } from "api/endpoints";
import useDispatchAction from "hooks/useDispatchAction";
import { setKycStatus } from "redux/slices/authenticationSlice";
import { toKycMode, IKycStatusPayload } from "types/kyc";

export const useKycStatusPolling = (enabled: boolean) => {
  const { data, refetch, isFetching } = useQuery({
    queryKey: ["kycStatus"],
    queryFn: async () => {
      const res = await apiClient.post<any>(AUTH.CYBIRD_KYC_STATUS, {}, false);
      return (res?.data ?? res) as IKycStatusPayload;
    },
    enabled,
    refetchInterval: enabled ? 15000 : false,
    refetchOnMount: enabled,
    refetchOnWindowFocus: enabled,
  });

  console.log("useKycStatusPolling data ->",JSON.stringify(data))

  const mode = useMemo(() => toKycMode(data), [data]);

  useEffect(() => {
    if (data) {
      useDispatchAction(setKycStatus(data));
    }
  }, [data]);

  return { mode, refetch, isFetching };
};


