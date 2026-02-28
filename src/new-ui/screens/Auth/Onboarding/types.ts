import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NewUIAuthStackParamList } from '@new-ui/navigationTypes';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';

export type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  NewUIAuthStackParamList,
  typeof NAVIGATION_SCREENS.NEW_ONBOARDING
>;
