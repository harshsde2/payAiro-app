import { ModalProps } from "react-native";

export interface PinScreenProps extends ModalProps {
    // isPinModalVisible?: boolean;
    // setIsPinModalVisible: (visible: boolean) => void;
    hiddenBalances:any,
    setHiddenBalances:any,
    onAction?:() => void,
    accountNumber?:any,
}

export interface PinScreenRef {
    toggleBalanceVisibility: (accountId: string) => void;
    checkUserPin: () => void;
}