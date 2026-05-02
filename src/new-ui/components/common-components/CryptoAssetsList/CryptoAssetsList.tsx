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

/**
 * Client-side fallback for full asset names when the market API does not
 * return a `name` field. Keys must be uppercase symbols.
 */
const ASSET_DISPLAY_NAMES: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  USDT: 'Tether',
  USDC: 'USD Coin',
  BNB: 'Binance Coin',
  SOL: 'Solana',
  XRP: 'XRP',
  ADA: 'Cardano',
  DOGE: 'Dogecoin',
  POL: 'Polygon',
  MATIC: 'Polygon',
  TRX: 'Tron',
  AVAX: 'Avalanche',
  LTC: 'Litecoin',
};

const resolveDisplayName = (item: ICryptoAssetItem): string => {
  const symbol = (item.asset ?? '').toUpperCase();
  if (item.name && item.name.trim().length > 0) return item.name;
  return ASSET_DISPLAY_NAMES[symbol] ?? (item.asset ?? '');
};

/**
 * Formats a USD price with adaptive precision so sub-dollar assets (USDC,
 * DOGE, POL) don't collapse to "$0.00" while large prices (BTC) stay readable.
 */
const formatUsd = (value: number | undefined): string => {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  if (n === 0) return '$0.00';
  const abs = Math.abs(n);
  let fractionDigits = 2;
  if (abs > 0 && abs < 1) fractionDigits = 4;
  if (abs > 0 && abs < 0.01) fractionDigits = 6;
  return `$${n.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
};

const formatQuantity = (qty: number, symbol: string): string => {
  const safe = Number.isFinite(qty) ? qty : 0;
  if (safe === 0) return `0 ${symbol}`;
  const abs = Math.abs(safe);
  let fractionDigits = 4;
  if (abs >= 1) fractionDigits = 4;
  if (abs >= 100) fractionDigits = 2;
  if (abs < 0.0001) fractionDigits = 8;
  return `${safe.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  })} ${symbol}`;
};

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
      platform_total_balance,
      usd_value_total,
      usd_value_available,
      usd_price,
      change_24h,
      logo,
    } = item;

    const symbol = asset ?? '';
    const displayName = resolveDisplayName(item);
    const quantityBalance =
      platform_available ?? platform_total_balance ?? rounded_balance ?? 0;
    const balanceUsd = usd_value_total ?? usd_value_available ?? 0;
    const marketUnitUsd = typeof usd_price === 'number' ? usd_price : 0;

    // Right-side big number: show the portfolio value if the user holds a
    // balance; otherwise fall back to the current market unit price so the row
    // never reads as "$0.00" next to a fully priced asset.
    const primaryUsd = balanceUsd > 0 ? balanceUsd : marketUnitUsd;
    const showBalanceSubline = balanceUsd > 0 && marketUnitUsd > 0;

    const hasChange =
      typeof change_24h === 'number' && Number.isFinite(change_24h);
    const changeColor = hasChange
      ? (change_24h as number) >= 0
        ? theme.colors.success
        : theme.colors.error
      : theme.colors.greyDark;

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
            {displayName}
          </CustomText>
          <CustomText variant="caption" fontWeight="regular" style={styles.quantityText}>
            {formatQuantity(Number(quantityBalance), symbol)}
          </CustomText>
        </View>

        <View style={styles.valueSection}>
          <CustomText variant="body" style={styles.usdValue} fontWeight="semiBold">
            {formatUsd(primaryUsd)}
          </CustomText>
          {hasChange ? (
            <CustomText variant="caption" fontWeight="semiBold" color={changeColor}>
              {(change_24h as number) >= 0 ? '+' : ''}
              {(change_24h as number).toFixed(2)}%
            </CustomText>
          ) : showBalanceSubline ? (
            <CustomText
              variant="caption"
              fontWeight="regular"
              color={theme.colors.greyDark}
            >
              {formatUsd(marketUnitUsd)} / {symbol}
            </CustomText>
          ) : null}
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
