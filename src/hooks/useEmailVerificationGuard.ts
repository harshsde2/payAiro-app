import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { useIsEmailVerified } from 'hooks/useIsEmailVerified';

/**
 * Gate money-movement actions behind email verification.
 *
 * `requireEmailVerified(onProceed)`: if the email is verified, runs `onProceed`
 * immediately; otherwise routes to the email verification screen and resumes
 * `onProceed` after a successful verification (auto-continue).
 */
export function useEmailVerificationGuard() {
  const navigation = useNavigation<any>();
  const { isEmailVerified } = useIsEmailVerified();

  const requireEmailVerified = useCallback(
    (onProceed: () => void) => {
      if (isEmailVerified) {
        onProceed();
        return;
      }
      navigation.navigate(NAVIGATION_SCREENS.NEW_EMAIL_VERIFICATION, {
        onVerified: onProceed,
      });
    },
    [isEmailVerified, navigation]
  );

  return { isEmailVerified, requireEmailVerified };
}
