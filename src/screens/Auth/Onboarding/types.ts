import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigations/types';
import { NAVIGATION_SCREENS } from '@navigations/navigationConstants';

export type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  typeof NAVIGATION_SCREENS.ONBOARDING
>;
