import React, { useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import Share from 'react-native-share';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { rewardsAndReferralsScreenStyles } from '@new-ui/styles/screens/rewards/rewardsAndReferralsScreenStyles';
import CustomText from '@new-ui/components/common-components/CustomText';
import CopyableField from '@new-ui/components/common-components/CopyableField';
import RewardBalanceCard from '@new-ui/components/common-components/RewardBalanceCard';
import { Button } from '@new-ui/components/common-components/layout';
import DashboardSection from 'tsx-components/DashboardSection';
import { useReferralMe, usePointsWallet } from 'query/hooks/useRewardsApi';
import { normalizePointsWallet } from '@new-ui/types/rewards';
import { generateReferralLink } from 'utils/linking';

const truncateMiddle = (value: string, head = 30): string =>
  value.length > head ? `${value.slice(0, head)}...` : value;

const ReferralsTab = () => {
  const { theme } = useTheme();
  const styles = rewardsAndReferralsScreenStyles(theme);

  const { data: referralResp, isLoading } = useReferralMe();
  const referral = referralResp?.data;
  const code = referral?.code ?? '';
  const link =
    referral?.share_url ?? (code ? generateReferralLink(code) : '');
  const referredCount = referral?.referred_count ?? 0;

  const { data: walletResp } = usePointsWallet();
  const wallet = normalizePointsWallet(walletResp?.data);
  const referralUsd = wallet.referralPoints * wallet.pointValueUsd;

  const handleShare = useCallback(async () => {
    if (!link) return;
    try {
      await Share.open({
        title: 'Join me on PayAiro',
        message: `Sign up on PayAiro with my referral code ${code} and earn rewards!\n${link}`,
        url: link,
      });
    } catch {
      // User dismissed the share sheet — no-op.
    }
  }, [link, code]);

  if (isLoading && !referral) {
    return (
      <View style={{ paddingVertical: theme.spacing['3xl'] }}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }

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

      <CopyableField label="Your Referral Code" value={code || '—'} />

      {link ? (
        <CopyableField
          label="Your Referral Link"
          value={link}
          displayValue={truncateMiddle(link)}
        />
      ) : null}

      <Button onPress={handleShare} style={styles.shareButton} disabled={!link}>
        Share
      </Button>

      <RewardBalanceCard
        title="Referral Balance"
        balance={referralUsd}
        subtitle={`Total Referrals: ${String(referredCount).padStart(2, '0')}`}
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
