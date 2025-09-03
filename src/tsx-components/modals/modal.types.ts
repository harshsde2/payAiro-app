import { ModalProps } from "react-native";

export interface PinScreenProps extends ModalProps {
  // isPinModalVisible?: boolean;
  // setIsPinModalVisible: (visible: boolean) => void;
  hiddenBalances?: any;
  setHiddenBalances?: any;
  onAction?: (data: any | undefined) => void;
  accountNumber?: any;
}

export interface PinScreenRef {
  toggleBalanceVisibility?: (accountId: any) => void;
  checkUserPin?: () => void;
  setUserPin?: () => void;
  onClose?: () => void;
}

export interface TermAndConditionModalProps extends ModalProps {
  onShow?: () => void;
  onHide?: () => void;
  onAgree?: () => void;
  onDecline?: () => void;
  isAgree?: boolean;
}
export interface TermAndConditionModalRef {
  showPatriotAct?: () => void;
  showESignDisclosure?: () => void;
  showTermsAndCondition?: () => void;
  hide?: () => void;
}
