import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api";
import { AUTH } from "../../api/endpoints";
import { UserDetailsResponse } from "../../screens/TSX-Screens/UserProfile/types";

export const useUserDetails = (username: string) => {
  return useQuery<UserDetailsResponse>({
    queryKey: ["user-details", username],
    queryFn: async () => {
      return await apiClient.get<UserDetailsResponse>(
        `${AUTH.USER_DETAILS}?user=${username}`
      );
    },
    enabled: !!username,
  });
};
