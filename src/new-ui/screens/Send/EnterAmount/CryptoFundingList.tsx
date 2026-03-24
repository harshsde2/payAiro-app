import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import CustomText from '@new-ui/components/common-components/CustomText';
import { SvgIcons } from 'constants/svgs';
import { enterAmountStyles } from '@new-ui/styles/screens/send/enterAmountStyles';
import type { CryptoFundingItem } from './cryptoFundingTypes';

type CryptoFundingListProps = {
  data: CryptoFundingItem[];
  onSelect?: (item: CryptoFundingItem) => void;
};

const CryptoFundingList: React.FC<CryptoFundingListProps> = ({ data, onSelect }) => {
  const { theme } = useTheme();
  const styles = enterAmountStyles(theme);

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  return (
    <View>
      {data.map((item, index) => {
        const {
          asset,
          rounded_balance,
          platform_available,
          platform_pending,
          platform_total_balance,
          usd_value_total,
          usd_value_available,
          logo,
        } = item;

        const pendingBalance = platform_pending ?? 0;
        const quantityBalance =
          platform_available ?? platform_total_balance ?? rounded_balance ?? 0;
        const usdValue = usd_value_total ?? usd_value_available ?? 0;

        const logoUri = logo as string | undefined;
        const isValidLogo = typeof logoUri === 'string' && logoUri.trim().length > 0;
        const isSvgLogo =
          isValidLogo &&
          (logoUri!.toLowerCase().endsWith('.svg') ||
            logoUri!.toLowerCase().includes('svg+xml'));

        return (
          <TouchableOpacity
            key={`${asset}-${index}`}
            style={styles.cryptoCard}
            activeOpacity={0.85}
            onPress={() => onSelect?.(item)}
          >
            <View style={styles.cryptoIconContainer}>
              {!isValidLogo ? (
                <SvgIcons.DollarIcon width={50} height={50} />
              ) : isSvgLogo ? (
                <View />
              ) : (
                <Image
                  source={{ uri: logoUri! }}
                  style={styles.cryptoIconImage}
                  resizeMode="contain"
                />
              )}
            </View>

            <View style={styles.cryptoInfoSection}>
              <CustomText variant="body" style={styles.cryptoAssetName} fontWeight="semiBold">
                {asset}
              </CustomText>
              <CustomText
                variant="caption"
                fontWeight="regular"
                style={styles.cryptoQuantityText}
              >
                {quantityBalance} {asset}
              </CustomText>
            </View>

            <View style={styles.cryptoValueSection}>
              <CustomText variant="body" style={styles.cryptoUsdValue} fontWeight="semiBold">
                ${typeof usdValue === 'number' ? usdValue.toFixed(2) : '0.00'}
              </CustomText>
              <CustomText variant="caption" style={styles.cryptoPendingText}>
                Pending: {pendingBalance}
              </CustomText>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CryptoFundingList;

