export interface IForceUpdateModalProps {
  isVisible: boolean;
  message?: string;
  storeVersion?: string;
  onUpdate: () => void;
  onClose?: () => void;
  forceUpdate?: boolean;
  isUpdating?: boolean;
  updateError?: string | null;
}
