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

const TOTAL_BALANCE = 10.45;

const RewardsAndReferralsScreen = () => {
  const { theme } = useTheme();
  const styles = rewardsAndReferralsScreenStyles(theme);
  const [activeTab, setActiveTab] = useState<'referrals' | 'rewards'>('referrals');
  const [breakdownVisible, setBreakdownVisible] = useState(false);

  return (
    <ScreenWrapper scrollable>
      <View style={styles.content}>
        <RewardBalanceCard
          title="Total Balance"
          balance={TOTAL_BALANCE}
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
        totalBalance={TOTAL_BALANCE}
      />
    </ScreenWrapper>
  );
};

export default RewardsAndReferralsScreen;
