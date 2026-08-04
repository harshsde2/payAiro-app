import React from 'react';
import { View, Image } from 'react-native';
import { SvgUri } from 'react-native-svg';
import CustomText from '@new-ui/components/common-components/CustomText';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { enterAmountStyles } from '@new-ui/styles/screens/send/enterAmountStyles';

interface ISendingAssetRowProps {
  /** Asset symbol being sent, e.g. "USDC". */
  symbol: string;
  /** Logo URL from the balances/market row. May be an .svg or a raster URL. */
  logo?: string;
}

/**
 * Shows which crypto is about to be sent. Read-only by design: the asset is decided
 * by how the user got here (registered-state stablecoin from the dashboard, or the
 * coin they opened Send from on its details screen) and is never theirs to change.
 */
const SendingAssetRow: React.FC<ISendingAssetRowProps> = ({ symbol, logo }) => {
  const { theme } = useTheme();
  const styles = enterAmountStyles(theme);

  const uri = typeof logo === 'string' ? logo.trim() : '';
  const hasLogo = uri.length > 0;
  const lower = uri.toLowerCase();
  // SvgUri (not <Image>) is required for vector logos — <Image> renders them blank.
  const isSvg = hasLogo && (lower.endsWith('.svg') || lower.includes('svg+xml'));

  return (
    <View style={styles.sendingAssetRow}>
      <View style={styles.sendingAssetLeft}>
        <View style={styles.sendingAssetIconCircle}>
          {!hasLogo ? (
            <CustomText variant="caption" fontWeight="semiBold">
              {symbol.slice(0, 1)}
            </CustomText>
          ) : isSvg ? (
            <SvgUri uri={uri} width={28} height={28} />
          ) : (
            <Image
              source={{ uri }}
              style={styles.sendingAssetIconImage}
              resizeMode="contain"
            />
          )}
        </View>
        <CustomText variant="h5" fontWeight="semiBold">
          {symbol}
        </CustomText>
      </View>

      <CustomText variant="bodySmall" color={theme.colors.greyDark}>
        Sending
      </CustomText>
    </View>
  );
};

export default SendingAssetRow;
