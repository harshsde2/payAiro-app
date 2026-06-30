import { View, TouchableOpacity } from 'react-native';
import React, { useRef } from 'react';
import ScreenWrapper from 'new-ui/components/common-components/ScreenWrapper';
import { useTheme as useNewUITheme } from '@new-ui/styles/ThemeContext';
import { AppIcon } from 'new-ui/assets/svgs';
import CustomText from 'new-ui/components/common-components/CustomText';
import TermAndConditionModal from 'tsx-components/modals/TermAndConditionModal';
import type { TermAndConditionModalRef } from 'tsx-components/modals/modal.types';
import { useComplianceStatus } from 'query/hooks/useComplianceDisclosure';

const COINME_TERMS_URL =
  'https://help.coinme.com/en/articles/9039676-terms-of-service';
const COINME_PRIVACY_URL =
  'https://help.coinme.com/en/articles/9039704-privacy-policy';
const COINME_DISCLOSURES_URL =
  'https://help.coinme.com/en/articles/10535881-disclosures';
const PAYAIRO_STATE_DISCLOSURES_URL = 'https://official.payairo.com/disclosures';

const CoinmeAgreementScreen = () => {
  const { theme: newUITheme } = useNewUITheme();
  const termsRef = useRef<TermAndConditionModalRef>(null);

  // Only users in regulated states (CT/MN/CA) see the PayAiro state disclosures link.
  const { data: complianceStatus } = useComplianceStatus();
  const showStateDisclosures = !!complianceStatus?.requiresCompliance;

  const LIST_ITEMS = [
    {
      title: 'Terms of Service',
      icon: <AppIcon.TermsAndConditions />,
      onPress: () =>
        termsRef.current?.showWebDocument?.(
          'Terms of Service',
          COINME_TERMS_URL
        ),
    },
    {
      title: 'Privacy Policy',
      icon: <AppIcon.PrivacyPolicy />,
      onPress: () =>
        termsRef.current?.showWebDocument?.(
          'Privacy Policy',
          COINME_PRIVACY_URL
        ),
    },
    {
      title: 'Disclosures',
      icon: <AppIcon.Agreement />,
      onPress: () =>
        termsRef.current?.showWebDocument?.(
          'Disclosures',
          COINME_DISCLOSURES_URL
        ),
    },
    ...(showStateDisclosures
      ? [
          {
            title: 'State Disclosures',
            icon: <AppIcon.Agreement />,
            onPress: () =>
              termsRef.current?.showWebDocument?.(
                'Coinme State Disclosures',
                PAYAIRO_STATE_DISCLOSURES_URL
              ),
          },
        ]
      : []),
  ];

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={['bottom']}
      scrollable
      contentStyle={{ flexGrow: 1, paddingBottom: 80, alignItems: 'center' }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 15,
          gap: 10,
          width: '100%',
        }}
      >
        {LIST_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={item.onPress}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderColor: newUITheme.colors.greyLight,
              borderWidth: 1,
              borderRadius: newUITheme.radius.lg,
              padding: newUITheme.spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {item.icon}
              <CustomText variant="h5" size={16} fontWeight="semiBold">
                {item.title}
              </CustomText>
            </View>
            <AppIcon.ChevronRight width={20} height={20} />
          </TouchableOpacity>
        ))}
      </View>
      <TermAndConditionModal isAgree={false} ref={termsRef} />
    </ScreenWrapper>
  );
};

export default CoinmeAgreementScreen;
