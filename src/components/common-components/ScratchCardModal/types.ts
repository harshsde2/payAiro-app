import { IRewardCard } from "../../../screens/Rewards/types";

export interface IScratchCardModalProps {
  isVisible: boolean;
  onClose: () => void;
  onScratchComplete: (cardId: number) => void;
  card: IRewardCard | null;
  isScratching: boolean;
}

export interface IScratchPath {
  x: number;
  y: number;
}

