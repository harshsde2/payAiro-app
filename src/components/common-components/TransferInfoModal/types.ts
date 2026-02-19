export interface ITransferInfoModalProps {
  isVisible: boolean;
  appName: string;
  /** When true, shows bank-specific copy (wire transfer / ACH transfer). */
  isBankApp?: boolean;
  onContinue: () => void;
  onClose: () => void;
}
