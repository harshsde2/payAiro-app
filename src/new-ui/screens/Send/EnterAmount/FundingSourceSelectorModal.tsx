import React, { useEffect, useRef } from 'react';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import CustomText from '@new-ui/components/common-components/CustomText';
import { BottomSheet } from '@new-ui/components/common-components/BottomSheet';
import { AppIcon } from '@new-ui/assets/svgs';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { enterAmountStyles } from '@new-ui/styles/screens/send/enterAmountStyles';
import type { FundingSource } from './enterAmount.types';
import type { IBottomSheetRef } from '@new-ui/components/common-components/BottomSheet/types';
import CryptoFundingList from './CryptoFundingList';
import type { CryptoFundingItem } from './cryptoFundingTypes';

type FundingSourceSelectorModalProps = {
  sources: FundingSource[];
  cryptoSources: CryptoFundingItem[];
  selectedSource: FundingSource | null;
  onSelect: (source: FundingSource) => void;
  onClose: () => void;
};

const maskLast4 = (id: string): string => {
  const last4 = id.slice(-4);
  return last4 ? `•••• ${last4}` : '••••';
};

const FundingSourceSelectorModal: React.FC<FundingSourceSelectorModalProps> = ({
  sources,
  cryptoSources,
  selectedSource,
  onSelect,
  onClose,
}) => {
  const { theme } = useTheme();
  const styles = enterAmountStyles(theme);
  const sheetRef = useRef<IBottomSheetRef | null>(null);

  const handleSelectCrypto = (item: CryptoFundingItem) => {
    const assetSymbol = item.asset || 'CRYPTO';
    const rawPrice = Number(item.usd_price ?? (item as any).price ?? 0);
    const maxAssetBalance = Number(
      item.platform_available ?? item.platform_total_balance ?? item.rounded_balance ?? 0
    );
    const maxUsdBalance = Number(item.usd_value_total ?? item.usd_value_available ?? 0);
    const derivedPriceFromTotals =
      maxAssetBalance > 0 && maxUsdBalance > 0 ? maxUsdBalance / maxAssetBalance : 0;
    const priceUSD =
      Number.isFinite(rawPrice) && rawPrice > 0
        ? rawPrice
        : Number.isFinite(derivedPriceFromTotals) && derivedPriceFromTotals > 0
          ? derivedPriceFromTotals
          : 0;

    onSelect({
      id: `crypto-${assetSymbol}`,
      name: assetSymbol,
      balance: maxAssetBalance,
      type: 'crypto',
      cryptoMeta: {
        symbol: assetSymbol,
        network: assetSymbol,
        priceUSD,
        maxAssetBalance: Number.isFinite(maxAssetBalance) ? maxAssetBalance : 0,
        maxUsdBalance: Number.isFinite(maxUsdBalance) ? maxUsdBalance : 0,
        logo: item.logo,
      },
    });
    sheetRef.current?.close();
  };

  useEffect(() => {
    // Open as soon as the sheet mounts.
    sheetRef.current?.open();
  }, []);

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        <BottomSheet
          ref={sheetRef}
          snapPoints={['85%', '98%']}
          initialSnapIndex={0}
          enableDrag
          enableBackdropPress={false}
          onClose={onClose}
        >
          <ScrollView
            style={styles.selectorContainer}
            contentContainerStyle={styles.selectorScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {Array.isArray(sources) && sources.length > 0 ? (
              <CustomText
                variant="label"
                fontWeight="semiBold"
                size={16}
                style={styles.selectorTitle}
              >
                Select bank
              </CustomText>
            ) : null}

            {sources.map((item: FundingSource) => {
                const isSelected = item.id === selectedSource?.id;
                const containerStyle = isSelected
                  ? styles.selectorItemSelected
                  : styles.selectorItem;
                const shouldShowPayairoIcon = item.name.toLowerCase().includes('payairo');

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.9}
                    style={containerStyle}
                    onPress={() => {
                      onSelect(item);
                      sheetRef.current?.close();
                    }}
                  >
                    <View style={styles.selectorItemRow}>
                      {shouldShowPayairoIcon ? (
                        <View style={styles.selectorItemPayairoIconCircle}>
                          <AppIcon.PayairoLogoBlack width={34} height={34} />
                        </View>
                      ) : null}

                      <View style={styles.selectorItemTextContainer}>
                        <CustomText
                          fontWeight="semiBold"
                          size={16}
                          style={styles.selectorItemTitle}
                          color={
                            isSelected ? theme.colors.white : theme.colors.text
                          }
                        >
                          {item.name}
                        </CustomText>
                        <CustomText
                          variant="caption"
                          size={13}
                          style={styles.selectorItemMasked}
                          color={
                            isSelected
                              ? theme.colors.white
                              : theme.colors.textSecondary
                          }
                        >
                          {maskLast4(item.id)}
                        </CustomText>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}

            {Array.isArray(cryptoSources) && cryptoSources.length > 0 ? (
              <View style={styles.cryptoSectionContainer}>
                <CustomText
                  variant="label"
                  fontWeight="semiBold"
                  size={16}
                  style={styles.cryptoSectionTitle}
                >
                  Crypto assets
                </CustomText>
                <CryptoFundingList data={cryptoSources} onSelect={handleSelectCrypto} />
              </View>
            ) : null}
          </ScrollView>
        </BottomSheet>
      </View>
    </Modal>
  );
};

export default FundingSourceSelectorModal;

