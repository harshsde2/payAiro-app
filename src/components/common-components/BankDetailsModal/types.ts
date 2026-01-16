export interface IBankDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  bankList: Array<{
    label: string;
    value: string;
    bank_name: string;
    account_number: string;
    account_type: string;
    guid: string;
  }>;
}
