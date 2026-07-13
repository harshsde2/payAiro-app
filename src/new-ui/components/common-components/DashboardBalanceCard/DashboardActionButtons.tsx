import React, { useMemo, useCallback, useRef } from 'react';
import { View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import IconWithNameContainer from '../IconWithNameContainer';
import { DASHBOARD_BALANCE_CARD_CONSTANTS } from './constant';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { toKycMode } from 'types/kyc';
import { ReceiveQRSheet } from '@new-ui/components/common-components/ReceiveQRSheet';
import type { IReceiveQRSheetRef } from '@new-ui/components/common-components/ReceiveQRSheet';

interface IDashboardActionButtonsProps {
  style?: object;
}

export const DashboardActionButtons: React.FC<IDashboardActionButtonsProps> = ({ style }) => {
  const navigation = useNavigation<any>();
  const { kycStatus, bankLists } = useSelector((state: any) => state.authenticationSlice);
  const receiveSheetRef = useRef<IReceiveQRSheetRef>(null);

  const kycMode = useMemo(() => toKycMode(kycStatus), [kycStatus]);
  const isKYCCompleted = !['not_started', 'pending', 'expired'].includes(kycMode);

  const userHasExternalAccount = useMemo(() => {
    if (!bankLists || !Array.isArray(bankLists)) return false;
    return bankLists.some((item: any) => item?.bank_type === 'external');
  }, [bankLists]);

  const handleKYCAlert = useCallback(() => {
    Alert.alert(
      'KYC Alert',
      'You need to complete your KYC to continue using the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Complete KYC', style: 'default', onPress: () => navigation.navigate(NAVIGATION_SCREENS.SETTING_SCREEN as never) },
      ]
    );
  }, [navigation]);

  const handleExternalAccountAlert = useCallback(() => {
    Alert.alert(
      'External Account Alert',
      'Please link your external account to continue to withdraw money.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Link External Account', style: 'default', onPress: () => navigation.navigate(NAVIGATION_SCREENS.PLAID_LINK_SCREEN as never) },
      ]
    );
  }, [navigation]);

  const getActionHandler = useCallback(
    (item: (typeof DASHBOARD_BALANCE_CARD_CONSTANTS)[0]) => {
      return () => {
        if (!isKYCCompleted) {
          handleKYCAlert();
          return;
        }
        if (item.requiresExternalAccount && !userHasExternalAccount) {
          handleExternalAccountAlert();
          return;
        }
        if (item.opensReceiveSheet) {
          receiveSheetRef.current?.open();
          return;
        }
        const screenName = NAVIGATION_SCREENS[item.screen as keyof typeof NAVIGATION_SCREENS];
        navigation.navigate(screenName as never, (item.params as never) ?? undefined);
      };
    },
    [isKYCCompleted, userHasExternalAccount, handleKYCAlert, handleExternalAccountAlert, navigation]
  );

  return (
    <View style={[{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',width: '100%' }, style]}>
      {DASHBOARD_BALANCE_CARD_CONSTANTS.map((item) => (
        <IconWithNameContainer
          key={item.name}
          icon={<item.icon width={48} height={48} />}
          name={item.name}
          iconSize={48}
          onPress={getActionHandler(item)}
        />
      ))}
      <ReceiveQRSheet ref={receiveSheetRef} />
    </View>
  );
};

export default DashboardActionButtons;
