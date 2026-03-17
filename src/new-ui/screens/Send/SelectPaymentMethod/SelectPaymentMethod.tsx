import React, { useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import CustomText from '@new-ui/components/common-components/CustomText';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { selectPaymentMethodStyles } from '@new-ui/styles/screens/send/selectPaymentMethodStyles';
import { AppIcon } from '@new-ui/assets/svgs';
import DashboardSection from 'tsx-components/DashboardSection';
import CryptoAssetsList from 'new-ui/components/common-components/CryptoAssetsList';

type SelectPaymentRouteParams = {
  type?: 'requested' | 'receive';
  sender: string;
  bank?: any;
};

type SelectPaymentRoute = RouteProp<{ params: SelectPaymentRouteParams }, 'params'>;

const SelectPaymentMethod: React.FC = () => {
  const { theme } = useTheme();
  const styles = selectPaymentMethodStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<SelectPaymentRoute>();

  const { type, sender, bank } = route.params || ({} as SelectPaymentRouteParams);

  const { bankLists, allCryptoBalances } = useSelector(
    (state: any) => state.authenticationSlice
  );

  const primaryBank = useMemo(() => {
    if (!Array.isArray(bankLists) || bankLists.length === 0) return null;
    return bankLists[0];
  }, [bankLists]);

  const getMaskedAccount = (accountNumber?: string | null) => {
    if (!accountNumber || accountNumber.length < 4) return '********';
    const last4 = accountNumber.slice(-4);
    return `******${last4}`;
  };

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={['bottom']}
      padding={16}
      scrollable
      contentStyle={styles.container}
    >
      <DashboardSection title="PayAiro">
        {primaryBank && (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => {
              navigation.navigate('EnterAmount' as never, {
                type,
                sender,
                bank,
              } as never);
            }}
          >
            <View style={styles.cardLeft}>
              <View style={styles.avatarCircle}>
                <AppIcon.PayairoLogoBlack width={42} height={42} />
              </View>
              <View>
                <CustomText
                  fontWeight="semiBold"
                  size={14}
                  style={styles.nameText}
                >
                  PayAiro Account
                </CustomText>
                <CustomText
                  variant='caption'
                  fontWeight='extraLight'
                  style={styles.subText}
                >
                  {getMaskedAccount(primaryBank?.account_number)}
                </CustomText>
              </View>
            </View>
            <CustomText style={styles.amountText}>
              ${(primaryBank?.balances?.available ?? '0.00') as any}
            </CustomText>
          </TouchableOpacity>
        )}
      </DashboardSection>


      <DashboardSection title="Crypto">
        <CryptoAssetsList data={allCryptoBalances?.filter((item: any) => item.asset !== 'Bank Balance') || []} isLoading={false} />

      </DashboardSection>
    </ScreenWrapper>
  );
};

export default SelectPaymentMethod;

