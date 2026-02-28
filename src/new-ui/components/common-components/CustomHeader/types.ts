import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { ReactNode } from 'react';

export interface ICustomHeaderProps extends NativeStackHeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightButton?: {
    icon?: ReactNode;
    onPress?: () => void;
  };
}

