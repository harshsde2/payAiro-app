import { StyleProp, TextStyle } from "react-native";

export interface NotificationTabButtonProps {
  isActive: boolean;
  label: string;
  onPress: () => void;
  textStyle?: StyleProp<TextStyle>;
}
