import { View, TouchableOpacity } from 'react-native'
import React from 'react'
import ScreenWrapper from 'new-ui/components/common-components/ScreenWrapper'
import { useTheme as useNewUITheme } from '@new-ui/styles/ThemeContext'
import { AppIcon } from 'new-ui/assets/svgs'
import CustomText from 'new-ui/components/common-components/CustomText'
import { useNavigation } from '@react-navigation/native'
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants'

const SettingsScreen = () => {
    const { theme: newUITheme } = useNewUITheme();
    const navigation = useNavigation<any>();

    const LIST_ITEMS = [
        {
            title: 'Privacy and Security',
            icon: <AppIcon.Privacy />,
            onPress: () => {},
        },
        {
            title: 'Bank Statements',
            icon: <AppIcon.BankStatement />,
            onPress: () => navigation.navigate(NAVIGATION_SCREENS.NEW_BANK_STATEMENT_SCREEN as never),
        },
        {
            title: 'Rewards and Referrals',
            icon: <AppIcon.RewardsIcon />,
            onPress: () => navigation.navigate(NAVIGATION_SCREENS.NEW_REWARDS_AND_REFERRALS_SCREEN as never),
        },
        {
            title: 'Coinme Legal',
            icon: <AppIcon.Agreement />,
            onPress: () =>
                navigation.navigate(
                    NAVIGATION_SCREENS.NEW_COINME_AGREEMENT_SCREEN as never
                ),
        },
        {
            title: 'Terms of Service',
            icon: <AppIcon.TermsAndConditions />,
            onPress: () =>
                navigation.navigate(NAVIGATION_SCREENS.PDF_VIEWER, {
                    url: require('../../../../assets/pdf/Terms_and_Conditions.pdf'),
                    isFileFromLocal: true,
                    fileName: 'Terms_and_Conditions.pdf',
                }),
        },
        {
            title: 'Privacy Policy',
            icon: <AppIcon.PrivacyPolicy />,
            onPress: () => {},
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
      <View style={{ flex:1,alignItems: 'center', justifyContent: 'space-between',  }}>
          <AppIcon.SocialMediaIcons />
          <CustomText variant="h3" size={16} fontWeight='semiBold'>PayAiro</CustomText>
          <View style={{  alignItems: 'center',paddingHorizontal: 20 }}>
            <CustomText variant="h5" size={16} style={{ textAlign: 'center' }} fontWeight='light'>© 2026 PAYAIRO Inc.
            All Rights Reserved. </CustomText>
          </View>
      </View>
    </ScreenWrapper>
  )
}

export default SettingsScreen
