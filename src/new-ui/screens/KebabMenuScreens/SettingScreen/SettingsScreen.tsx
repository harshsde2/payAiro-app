import { View, TouchableOpacity } from 'react-native'
import React, { useMemo, useRef } from 'react'
import DeviceInfo from 'react-native-device-info'
import ScreenWrapper from 'new-ui/components/common-components/ScreenWrapper'
import { useTheme as useNewUITheme } from '@new-ui/styles/ThemeContext'
import { AppIcon } from 'new-ui/assets/svgs'
import CustomText from 'new-ui/components/common-components/CustomText'
import { useNavigation } from '@react-navigation/native'
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants'
import TermAndConditionModal from 'tsx-components/modals/TermAndConditionModal'
import type { TermAndConditionModalRef } from 'tsx-components/modals/modal.types'
import { useComplianceStatus } from 'query/hooks/useComplianceDisclosure'
import { EnvConfig } from 'config/env.config'

const SettingsScreen = () => {
    const { theme: newUITheme } = useNewUITheme();
    const navigation = useNavigation<any>();
    const webDocRef = useRef<TermAndConditionModalRef>(null);
    const PAYAIRO_TERMS_URL = EnvConfig.TERMS_AND_CONDITIONS_URL;
    const PAYAIRO_PRIVACY_URL = EnvConfig.PRIVACY_POLICY_URL;

    // App version for the footer. DeviceInfo getters are native calls that can throw
    // if unlinked, so guard each read and fall back rather than crash the screen.
    const appVersionLabel = useMemo(() => {
      try {
        const version = DeviceInfo.getVersion();
        const build = String(DeviceInfo.getBuildNumber());
        return version ? `Version ${version} (${build})` : '';
      } catch {
        return '';
      }
    }, []);

    // Acknowledgment History is only relevant to Connecticut users (one-time +
    // per-transaction disclosures). Hidden entirely for everyone else.
    const { data: complianceStatus } = useComplianceStatus();
    const isCtUser = complianceStatus?.stateCode === 'CT';

    const LIST_ITEMS = [
        {
            title: 'Privacy and Security',
            icon: <AppIcon.Privacy />,
            onPress: () => navigation.navigate(NAVIGATION_SCREENS.NEW_PRIVACY_SECURITY_SCREEN as never),
        },
        {
            title: 'Payment Methods',
            // DebitCard is a bare 24px glyph (no badge), unlike the other 40px badged
            // icons — wrap it in a matching green circle so it aligns with the rest.
            icon: (
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3FBF4', alignItems: 'center', justifyContent: 'center' }}>
                    <AppIcon.DebitCard width={22} height={22} />
                </View>
            ),
            onPress: () => navigation.navigate(NAVIGATION_SCREENS.PAYMENT_METHODS_SCREEN as never),
        },
        // {
        //     title: 'Bank Statements',
        //     icon: <AppIcon.BankStatement />,
        //     onPress: () => navigation.navigate(NAVIGATION_SCREENS.NEW_BANK_STATEMENT_SCREEN as never),
        // },
        // {
        //     title: 'Rewards and Referrals',
        //     icon: <AppIcon.RewardsIcon />,
        //     onPress: () => navigation.navigate(NAVIGATION_SCREENS.NEW_REWARDS_AND_REFERRALS_SCREEN as never),
        // },
        {
            title: 'Coinme Legal',
            icon: <AppIcon.Agreement />,
            onPress: () =>
                navigation.navigate(
                    NAVIGATION_SCREENS.NEW_COINME_AGREEMENT_SCREEN as never
                ),
        },
        // ...(isCtUser
        //     ? [{
        //         title: 'Acknowledgment History',
        //         icon: <AppIcon.Agreement />,
        //         onPress: () =>
        //             navigation.navigate(
        //                 NAVIGATION_SCREENS.NEW_ACKNOWLEDGMENT_HISTORY_SCREEN as never
        //             ),
        //     }]
        //     : []),
        {
            title: 'Terms of Service',
            icon: <AppIcon.TermsAndConditions />,
            onPress: () => webDocRef.current?.showWebDocument?.('Terms of Service', PAYAIRO_TERMS_URL),
        },
        {
            title: 'Privacy Policy',
            icon: <AppIcon.PrivacyPolicy />,
            onPress: () => webDocRef.current?.showWebDocument?.('Privacy Policy', PAYAIRO_PRIVACY_URL),
        },
        {
            title: 'App Version',
            icon: <AppIcon.AppVersion />,
            onPress: () => navigation.navigate(NAVIGATION_SCREENS.NEW_APP_VERSION_SCREEN as never),
        },
    ]

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["bottom"]}
      scrollable
      contentStyle={{ flexGrow: 1, paddingBottom: 80, alignItems: 'center' }}
    >
      <View style={{ flex: 1, paddingHorizontal: 15, gap: 10, width: '100%' }}>
        {LIST_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              activeOpacity={0.7}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderColor: newUITheme.colors.greyLight, borderWidth: 1, borderRadius: newUITheme.radius.lg, padding: newUITheme.spacing.md }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {item.icon}
                    <CustomText variant="h5" size={16} fontWeight='semiBold'>{item.title}</CustomText>
                </View>
                <AppIcon.ChevronRight width={20} height={20} />
            </TouchableOpacity>
        ))}
      </View>
      <View style={{ alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <CustomText variant="h3" size={26} fontWeight='semiBold'>PayAiro</CustomText>
          <View style={{  alignItems: 'center',paddingHorizontal: 20 }}>
            <CustomText variant="h5" size={16} style={{ textAlign: 'center' }} fontWeight='light'>© 2026 PayAiro Inc.
            All Rights Reserved. </CustomText>
            {appVersionLabel ? (
              <CustomText
                variant="body"
                size={13}
                color={newUITheme.colors.greyDark}
                style={{ textAlign: 'center', marginTop: 4 }}
                fontWeight="light"
              >
                {appVersionLabel}
              </CustomText>
            ) : null}
          </View>
      </View>
      <TermAndConditionModal isAgree={false} ref={webDocRef} />
    </ScreenWrapper>
  )
}

export default SettingsScreen
