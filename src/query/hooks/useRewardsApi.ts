import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { REWARDS } from 'api/endpoints';
import { userApiClient } from 'api/userApiClient';
import { showError, showSuccess } from 'utils/toast';
import {
  ClaimResponse,
  PointsWalletResponse,
  ReferralMeResponse,
  ReferralValidateResponse,
  ScratchCardStatus,
  ScratchCardsResponse,
  ScratchResponse,
} from '@new-ui/types/rewards';

export const rewardKeys = {
  all: ['rewards'] as const,
  referralMe: () => [...rewardKeys.all, 'referralMe'] as const,
  scratchCards: (status?: ScratchCardStatus | 'all') =>
    [...rewardKeys.all, 'scratchCards', status ?? 'all'] as const,
  points: () => [...rewardKeys.all, 'points'] as const,
};

/** Current user's referral code + share URL. First call creates the code. */
export function useReferralMe(enabled: boolean = true) {
  return useQuery({
    queryKey: rewardKeys.referralMe(),
    queryFn: async () =>
      await userApiClient.get<ReferralMeResponse>(REWARDS.REFERRAL_ME),
    staleTime: 60_000,
    enabled,
  });
}

/** Validate a referral code before signup (public endpoint). */
export function useValidateReferralCode() {
  return useMutation({
    mutationFn: async (referralCode: string) =>
      await userApiClient.post<ReferralValidateResponse>(
        REWARDS.REFERRAL_VALIDATE,
        { referral_code: referralCode }
      ),
  });
}

/** Scratch cards list, optionally filtered by status. */
export function useScratchCards(status?: ScratchCardStatus) {
  return useQuery({
    queryKey: rewardKeys.scratchCards(status),
    queryFn: async () => {
      const url = status
        ? `${REWARDS.SCRATCH_CARDS}?status=${encodeURIComponent(status)}`
        : REWARDS.SCRATCH_CARDS;
      return await userApiClient.get<ScratchCardsResponse>(url);
    },
    staleTime: 0,
  });
}

/** Points wallet summary (balance + value). */
export function usePointsWallet(enabled: boolean = true) {
  return useQuery({
    queryKey: rewardKeys.points(),
    queryFn: async () => {
      const resp = await userApiClient.get<PointsWalletResponse>(REWARDS.POINTS);
      if (__DEV__) {
        // TODO: remove once /rewards/points/ field names are confirmed.
        console.log('[rewards] points wallet =>', JSON.stringify(resp));
      }
      return resp;
    },
    staleTime: 0,
    enabled,
  });
}

const rewardsErrorMessage = (error: any, fallback: string): string =>
  error?.response?.data?.message ||
  error?.response?.data?.error_code ||
  error?.message ||
  fallback;

/** Scratch (redeem) a single card; adds reward_points. */
export function useScratchCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cardId: number | string) =>
      await userApiClient.post<ScratchResponse>(
        REWARDS.SCRATCH_CARD_SCRATCH(cardId),
        {}
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: rewardKeys.all }),
      ]);
    },
    onError: (error: any) => {
      showError(rewardsErrorMessage(error, 'Could not scratch this card.'));
    },
  });
}

/** Claim points into the wallet. Pass a number to claim partial, omit to claim all. */
export function useClaimPoints() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (points?: number) =>
      await userApiClient.post<ClaimResponse>(
        REWARDS.POINTS_CLAIM,
        typeof points === 'number' ? { points } : {}
      ),
    onSuccess: async (data) => {
      showSuccess(data?.message || 'Points claimed successfully!');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: rewardKeys.points() }),
        queryClient.invalidateQueries({
          queryKey: [...rewardKeys.all, 'scratchCards'],
        }),
      ]);
    },
    onError: (error: any) => {
      showError(rewardsErrorMessage(error, 'Could not claim points.'));
    },
  });
}
