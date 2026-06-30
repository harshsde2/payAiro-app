import React, { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { rewardsAndReferralsScreenStyles } from '@new-ui/styles/screens/rewards/rewardsAndReferralsScreenStyles';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import RewardBalanceCard from '@new-ui/components/common-components/RewardBalanceCard';
import FilterChip from '@new-ui/components/common-components/FilterChip';
import ReferralsTab from './ReferralsTab';
import RewardsTab from './RewardsTab';
import RewardsBreakdownModal from './RewardsBreakdownModal';
import { usePointsWallet } from 'query/hooks/useRewardsApi';
import { normalizePointsWallet } from '@new-ui/types/rewards';

const RewardsAndReferralsScreen = () => {
  const { theme } = useTheme();
  const styles = rewardsAndReferralsScreenStyles(theme);
  const [activeTab, setActiveTab] = useState<'referrals' | 'rewards'>('referrals');
  const [breakdownVisible, setBreakdownVisible] = useState(false);

  const { data: walletResp } = usePointsWallet();
  const wallet = normalizePointsWallet(walletResp?.data);
  const rewardsUsd = wallet.transactionPoints * wallet.pointValueUsd;
  const referralsUsd = wallet.referralPoints * wallet.pointValueUsd;
  const totalBalance = wallet.valueUsd || rewardsUsd + referralsUsd;

  const breakdownRows = [
    { label: 'Rewards', amount: `$${rewardsUsd.toFixed(2)}` },
    { label: 'Referrals', amount: `$${referralsUsd.toFixed(2)}` },
  ];

  return (
    <ScreenWrapper scrollable>
      <View style={styles.content}>
        <RewardBalanceCard
          title="Total Balance"
          balance={totalBalance}
          subtitle="Details"
          onSubtitlePress={() => setBreakdownVisible(true)}
        />

        <View style={styles.tabRow}>
          <View style={styles.tabChip}>
            <FilterChip
              label="Referrals"
              selected={activeTab === 'referrals'}
              onPress={() => setActiveTab('referrals')}
            />
          </View>
          <View style={styles.tabChip}>
            <FilterChip
              label="Rewards"
              selected={activeTab === 'rewards'}
              onPress={() => setActiveTab('rewards')}
            />
          </View>
        </View>

        {activeTab === 'referrals' ? <ReferralsTab /> : <RewardsTab />}
      </View>

      <RewardsBreakdownModal
        visible={breakdownVisible}
        onClose={() => setBreakdownVisible(false)}
        totalBalance={totalBalance}
        rows={breakdownRows}
      />
    </ScreenWrapper>
  );
};

export default RewardsAndReferralsScreen;
