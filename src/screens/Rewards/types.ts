export interface IRewardCard {
  id: number;
  title: string;
  description: string;
  points_required: number;
  reward_description: string;
  reward_amount: number;
  is_redeem: boolean;
  image_url: string | null;
  can_scratch: boolean;
  is_scratched: boolean;
  is_redeemed: boolean;
  scratched_at: string | null;
  redeemed_at: string | null;
  created_at: string;
}

export interface IPointsInfo {
  total_points: number;
  points_used: number;
  available_points: number;
}

export interface IScratchRewards {
  total_scratched: number;
  total_scratched_reward: number;
  scratch_reward_claimed: number;
  available_scratch_reward: number;
  can_claim: boolean;
}

export interface IScratchCardHistory {
  id: number;
  scratch_card: {
    id: number;
    title: string;
    description: string;
    reward_description: string;
    reward_amount: number;
    is_redeem: boolean;
  };
  points_used: number;
  reward_received: boolean;
  scratched_at: string;
  reward_received_at: string | null;
}

export interface IScratchCardsResponse {
  points_info: IPointsInfo;
  scratch_rewards: IScratchRewards;
  cards: IRewardCard[];
  history: IScratchCardHistory[];
}

export interface IBalanceData {
  points: number;
  rewards: number;
}

