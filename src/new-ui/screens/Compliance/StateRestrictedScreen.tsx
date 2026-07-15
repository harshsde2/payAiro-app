import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import CustomText from '@new-ui/components/common-components/CustomText';
import Button from '@new-ui/components/common-components/layout/Button';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { performAppLogout } from 'utils/performAppLogout';

type RouteParams = {
  StateRestrictedBlock: {
    stateCode: string;
  };
};

const STATE_NAMES: Record<string, string> = {
  NY: 'New York',
  VT: 'Vermont',
};

/**
 * Non-dismissible block screen for states where PayAiro is unavailable (NY / VT).
 *
 * Presented by useBlockedStateGate when the user's registered address is in a
 * blocked state. Every dismissal path is refused (Android back, swipe, programmatic
 * pops) — the only way out is logging out.
 */
const StateRestrictedScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route =
    useRoute<RouteProp<RouteParams, typeof NAVIGATION_SCREENS.STATE_RESTRICTED_BLOCK>>();
  const stateCode = route.params?.stateCode ?? '';
  const stateName = STATE_NAMES[stateCode] || 'your state';

  const [loggingOut, setLoggingOut] = useState(false);
  const styles = makeStyles(theme);

  // Regulatory block: refuse every dismissal until the user logs out.
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      e.preventDefault();
    });
    return unsubscribe;
  }, [navigation]);

  const handleLogout = useCallback(async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await performAppLogout();
    } finally {
      setLoggingOut(false);
    }
  }, [loggingOut]);

  return (
    <ScreenWrapper
      safeAreaEdges={['top', 'bottom', 'left', 'right']}
      backgroundColor={theme.colors.white}
      statusBarStyle="dark-content"
      contentStyle={{ flex: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.body}>
          <CustomText variant="h2" fontWeight="bold" align="center" style={styles.title}>
            PayAiro isn't available in {stateName}
          </CustomText>
          <CustomText
            variant="body"
            color={theme.colors.textSecondary}
            align="center"
            style={styles.message}
          >
            Due to current state regulations, PayAiro services are not available to residents of
            New York and Vermont. You won't be able to use the app while your registered address is
            in {stateName}.
          </CustomText>
          <CustomText
            variant="body"
            color={theme.colors.textSecondary}
            align="center"
            style={styles.message}
          >
            If your address has changed, please contact support so we can update your profile.
          </CustomText>
        </View>

        <View style={styles.footer}>
          <Button onPress={handleLogout} loading={loggingOut} disabled={loggingOut}>
            Log Out
          </Button>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const makeStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.base,
    },
    body: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.md,
    },
    title: {
      marginBottom: theme.spacing.sm,
    },
    message: {
      lineHeight: 22,
    },
    footer: {
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.lg,
    },
  });

export default StateRestrictedScreen;
