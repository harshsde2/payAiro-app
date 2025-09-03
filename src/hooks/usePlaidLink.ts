import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NAVIGATION_SCREENS } from '../navigations/navigationConstants';

interface UsePlaidLinkOptions {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const usePlaidLink = (options: UsePlaidLinkOptions = {}) => {
  const navigation = useNavigation();

  const openPlaidLink = useCallback(() => {
    navigation.navigate(NAVIGATION_SCREENS.PLAID_LINK_SCREEN as never, {
      onSuccess: options.onSuccess,
      onCancel: options.onCancel,
    } as never);
  }, [navigation, options.onSuccess, options.onCancel]);

  return {
    openPlaidLink,
  };
};
