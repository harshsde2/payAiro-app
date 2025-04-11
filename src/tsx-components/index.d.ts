import { ComponentType, ReactNode } from 'react';
import { StyleProp, TextProps, TextStyle, ViewStyle } from 'react-native';

// Card types
export interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  borderRadius?: number;
  elevation?: number;
  shadowColor?: string;
  borderColor?: string;
  borderWidth?: number;
  padding?: number;
}

export const Card: ComponentType<CardProps>;

// CustomText types
type FontWeight = 'regular' | 'medium' | 'semiBold' | 'bold';
type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'button' | 'caption';

export interface CustomTextProps extends TextProps {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  variant?: TextVariant;
  fontWeight?: FontWeight;
  color?: string;
  size?: number;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  fontFamily?: string;
}

export const CustomText: ComponentType<CustomTextProps>;

// CryptoCard types
export interface CryptoCardProps {
  isCrypto: boolean;
  onSwitchView: () => void;
  headerTitle: string;
  balance: number;
  currencySymbol?: string;
  currencyIcon?: string;
  identifierType?: string;
  identifier?: string;
  pendingAmount?: number;
  onCopy?: () => void;
  onWithdraw?: () => void;
  rightSideIcon?: ReactNode;
  logoSvg?: string;
}

export const CryptoCard: ComponentType<CryptoCardProps>;

// DashboardHeader types
export interface DashboardHeaderProps {
  name: string;
}

export const DashboardHeader: ComponentType<DashboardHeaderProps>;

// FontTest type
export const FontTest: ComponentType<{}>;

// ExampleComponents type
export const ExampleComponents: ComponentType<{}>; 