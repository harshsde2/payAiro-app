import React from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { cryptoAssetCardStyles } from '@new-ui/styles/components/cryptoAssetCardStyles';
import CustomText from '@new-ui/components/common-components/CustomText';
import { SvgIcons } from 'constants/svgs';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { ICryptoAssetsListProps, ICryptoAssetItem } from './types';

const CryptoAssetsList: React.FC<ICryptoAssetsListProps> = ({
  data = [],
  isLoading = false,
}) => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = cryptoAssetCardStyles(theme);

  const renderCryptoAssetItem = ({
    item,
  }: {
    item: ICryptoAssetItem;
    index: number;
  }) => {
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

    const availableBalance = platform_available ?? 0;
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
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => {
          if (item?.asset != 'Bank Balance') {
            navigation.navigate(NAVIGATION_SCREENS.CRYPTO_DETAILS as never, {
              item: item,
            });
          }
        }}
      >
        <View style={styles.iconContainer}>
          {!isValidLogo ? (
            <SvgIcons.DollarIcon width={50} height={50} />
          ) : isSvgLogo ? (
            <View />
          ) : (
            <Image
              source={{ uri: logoUri! }}
              style={styles.iconImage}
              resizeMode="contain"
            />
          )}
        </View>

        <View style={styles.infoSection}>
          <CustomText variant="body" style={styles.assetName} fontWeight="semiBold">
            {asset}
          </CustomText>
          <CustomText variant='caption' fontWeight='regular' style={styles.quantityText}>
            {quantityBalance} {asset}
          </CustomText>
        </View>

        <View style={styles.valueSection}>
          <CustomText variant="body" style={styles.usdValue} fontWeight="semiBold">
            ${typeof usdValue === 'number' ? usdValue.toFixed(2) : '0.00'}
          </CustomText>
          {/* <CustomText variant="caption" style={styles.availableText}>
            Pending: {pendingBalance}
          </CustomText> */}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#2F6B3B" />
        <CustomText variant="caption" style={{ marginTop: 8 }}>
          Loading assets...
        </CustomText>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <CustomText variant="caption" color={theme.colors.greyDark}>
          No crypto assets found
        </CustomText>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      showsVerticalScrollIndicator={false}
      renderItem={renderCryptoAssetItem}
      keyExtractor={(item, index) => `${item?.asset}-${index}`}
      scrollEnabled={false}
    />
  );
};

export default CryptoAssetsList;
