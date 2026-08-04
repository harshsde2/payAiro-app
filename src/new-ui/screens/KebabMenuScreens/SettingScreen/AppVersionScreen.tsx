import React, { useCallback, useMemo } from 'react';
import { Platform, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import DeviceInfo from 'react-native-device-info';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import CustomText from '@new-ui/components/common-components/CustomText';
import { Button } from '@new-ui/components/common-components/layout';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { appVersionStyles } from '@new-ui/styles/screens/settings/appVersionStyles';
import { showSuccess } from 'utils/toast';

/**
 * Every DeviceInfo getter is a native call that can throw if the module failed to
 * link — this screen must never be the reason the app crashes, so each read falls
 * back to a placeholder rather than propagating.
 */
const safeRead = (read: () => string, fallback: string): string => {
  try {
    const value = read();
    return value && value.trim().length ? value : fallback;
  } catch {
    return fallback;
  }
};

const AppVersionScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = appVersionStyles(theme);

  const info = useMemo(() => {
    const version = safeRead(() => DeviceInfo.getVersion(), '—');
    // iOS calls it the build number (CFBundleVersion), Android the versionCode —
    // same field to DeviceInfo, so the label is what changes per platform.
    const build = safeRead(() => String(DeviceInfo.getBuildNumber()), '—');
    return {
      version,
      build,
      buildLabel: Platform.OS === 'ios' ? 'Build number' : 'Version code',
      platform: Platform.OS === 'ios' ? 'iOS' : 'Android',
      osVersion: safeRead(() => String(Platform.Version), '—'),
      bundleId: safeRead(() => DeviceInfo.getBundleId(), '—'),
      device: safeRead(() => DeviceInfo.getModel(), '—'),
    };
  }, []);

  const rows = useMemo(
    () => [
      { label: 'App version', value: info.version },
      { label: 'Platform', value: `${info.platform} ${info.osVersion}` },
      { label: 'Device', value: info.device },
    ],
    [info]
  );

  const handleCopy = useCallback(() => {
    // One block support can read at a glance, rather than the user relaying five
    // fields by hand.
    Clipboard.setString(rows.map((row) => `${row.label}: ${row.value}`).join('\n'));
    showSuccess('Copied', 'App details copied to your clipboard.');
  }, [rows]);

  return (
    <ScreenWrapper safeArea safeAreaEdges={['bottom']} scrollable contentStyle={styles.content}>
      <View style={styles.brand}>
        <CustomText variant="h2" size={26} fontWeight="semiBold">
          PayAiro
        </CustomText>
        <CustomText
          variant="body"
          size={14}
          color={theme.colors.greyDark}
          style={styles.versionHeadline}
        >
          Version {info.version} ({info.build})
        </CustomText>
      </View>

      <View style={styles.card}>
        {rows.map((row, index) => (
          <View
            key={row.label}
            style={[styles.row, index > 0 && styles.rowDivider]}
          >
            <CustomText variant="body" size={14} fontWeight="semiBold">
              {row.label}
            </CustomText>
            <CustomText
              variant="body"
              size={14}
              color={theme.colors.greyDark}
              numberOfLines={1}
              style={styles.rowValue}
            >
              {row.value}
            </CustomText>
          </View>
        ))}
      </View>

      <View style={styles.spacer} />

      <Button onPress={handleCopy} style={styles.copyButton}>
        Copy details
      </Button>
    </ScreenWrapper>
  );
};

export default AppVersionScreen;
