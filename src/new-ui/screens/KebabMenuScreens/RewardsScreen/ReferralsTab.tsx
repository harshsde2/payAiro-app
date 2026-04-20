import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { rewardsAndReferralsScreenStyles } from '@new-ui/styles/screens/rewards/rewardsAndReferralsScreenStyles';
import CustomText from '@new-ui/components/common-components/CustomText';
import CopyableField from '@new-ui/components/common-components/CopyableField';
import RewardBalanceCard from '@new-ui/components/common-components/RewardBalanceCard';
import { Button } from '@new-ui/components/common-components/layout';
import DashboardSection from 'tsx-components/DashboardSection';
import { AppIcon } from '@new-ui/assets/svgs';

const ReferralsTab = () => {
  const { theme } = useTheme();
  const styles = rewardsAndReferralsScreenStyles(theme);

  return (
    <View>
      <CustomText
        variant="body"
        fontFamily="inter"
        size={14}
        style={styles.subtitle}
      >
        Share your referral code with friends and{'\n'}earn rewards when they sign up!
      </CustomText>

      <CopyableField
        label="Your Referral Code"
        value="PAYAIRO123"
      />

      <CopyableField
        label="Your Referral Link"
        value="https://www.payairo.us/refer?invite=PAYAIRO123"
        displayValue="https://www.payairo.us/refer?in..."
      />

      <Button onPress={() => {}} style={styles.shareButton}>
        Share
      </Button>

      <RewardBalanceCard
        title="Referral Balance"
        balance={10.0}
        subtitle="Total Referrals: 02"
        subtitleColor={theme.colors.primary}
      />

      <View style={{ marginTop: theme.spacing.base }}>
        <DashboardSection title="Recent Referrals">
          <View style={styles.noActivityCard}>
            <CustomText variant="body" fontWeight="semiBold" color={theme.colors.text}>
              No Activity yet!
            </CustomText>
          </View>
        </DashboardSection>
      </View>
    </View>
  );
};

export default ReferralsTab;
