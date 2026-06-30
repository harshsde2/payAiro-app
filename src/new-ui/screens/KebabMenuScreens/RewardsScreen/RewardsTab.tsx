import React, { useState, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { rewardsAndReferralsScreenStyles } from '@new-ui/styles/screens/rewards/rewardsAndReferralsScreenStyles';
import CustomText from '@new-ui/components/common-components/CustomText';
import RewardBalanceCard from '@new-ui/components/common-components/RewardBalanceCard';
import ScratchVoucherCard from '@new-ui/components/common-components/ScratchVoucherCard';
import DashboardSection from 'tsx-components/DashboardSection';
import RewardsDetailModal from './RewardsDetailModal';
import { useScratchCards, usePointsWallet } from 'query/hooks/useRewardsApi';
import { ScratchCardItem, normalizePointsWallet } from '@new-ui/types/rewards';

const RewardsTab = () => {
  const { theme } = useTheme();
  const styles = rewardsAndReferralsScreenStyles(theme);
  const navigation = useNavigation<any>();
  const [detailVisible, setDetailVisible] = useState(false);

  const { data: cardsResp, isLoading } = useScratchCards('issued');
  const cards = cardsResp?.data?.items ?? [];

  const { data: walletResp } = usePointsWallet();
  const wallet = normalizePointsWallet(walletResp?.data);
  const pointsBalance = wallet.pointsBalance;
  const rewardUsd = wallet.valueUsd;

  const handleVoucherPress = useCallback(
    (card: ScratchCardItem) => {
      navigation.navigate(NAVIGATION_SCREENS.NEW_SCRATCH_CARD_SCREEN, {
        cardId: card.id,
        points: card.reward_points ?? 0,
      });
    },
    [navigation],
  );

  return (
    <View>
      <RewardBalanceCard
        title="Reward Balance"
        balance={rewardUsd}
        subtitle={`Points: ${pointsBalance}`}
        subtitleColor={theme.colors.greyDark}
        showChevron
        onChevronPress={() => setDetailVisible(true)}
      />

      <View style={{ marginTop: theme.spacing.base }}>
        <DashboardSection title="Scratch Vouchers">
          {isLoading && cards.length === 0 ? (
            <View style={{ paddingVertical: theme.spacing['3xl'] }}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : cards.length === 0 ? (
            <View style={styles.noActivityCard}>
              <CustomText variant="body" fontWeight="semiBold" color={theme.colors.text}>
                No scratch cards yet!
              </CustomText>
            </View>
          ) : (
            <View style={styles.voucherGrid}>
              {cards.map(card => (
                <View key={String(card.id)} style={styles.voucherHalf}>
                  <ScratchVoucherCard
                    points={card.reward_points ?? 0}
                    onPress={() => handleVoucherPress(card)}
                  />
                </View>
              ))}
            </View>
          )}
        </DashboardSection>
      </View>

      <RewardsDetailModal
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        balance={rewardUsd}
        rows={[
          { label: 'Points Balance', value: String(pointsBalance) },
          { label: 'Value', value: `$${rewardUsd.toFixed(2)}` },
          { label: 'Pending Points', value: String(wallet.pendingPoints) },
          { label: 'Claimed Points', value: String(wallet.claimedPoints) },
        ]}
      />
    </View>
  );
};

export default RewardsTab;
