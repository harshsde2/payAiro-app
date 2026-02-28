import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export type SnapPoint = number | string;

export interface IBottomSheetConfig {
  snapPoints?: SnapPoint[];
  initialSnapIndex?: number;
  enableDrag?: boolean;
  enableBackdropPress?: boolean;
  backdropOpacity?: number;
  handleIndicatorStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onOpen?: () => void;
  onClose?: () => void;
  onChange?: (index: number) => void;
}

export interface IBottomSheetProps extends IBottomSheetConfig {
  children?: ReactNode;
}

export interface IBottomSheetRef {
  open: (content?: ReactNode, config?: IBottomSheetConfig) => void;
  close: () => void;
  snapToIndex: (index: number) => void;
  expand: () => void;
  collapse: () => void;
  isOpen: boolean;
}

export interface IBottomSheetContextValue {
  open: (content: ReactNode, config?: IBottomSheetConfig) => void;
  close: () => void;
  snapToIndex: (index: number) => void;
  expand: () => void;
  collapse: () => void;
  isOpen: boolean;
}

export interface IBottomSheetProviderProps {
  children: ReactNode;
}

