import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { rewardsAndReferralsScreenStyles } from '@new-ui/styles/screens/rewards/rewardsAndReferralsScreenStyles';
import RewardBalanceCard from '@new-ui/components/common-components/RewardBalanceCard';
import ScratchVoucherCard from '@new-ui/components/common-components/ScratchVoucherCard';
import DashboardSection from 'tsx-components/DashboardSection';
import RewardsDetailModal from './RewardsDetailModal';

const VOUCHERS = [
  { id: 'v1', points: 100 },
  { id: 'v2', points: 200 },
  { id: 'v3', points: 500 },
  { id: 'v4', points: 1000 },
];

const RewardsTab = () => {
  const { theme } = useTheme();
  const styles = rewardsAndReferralsScreenStyles(theme);
  const navigation = useNavigation<any>();
  const [detailVisible, setDetailVisible] = useState(false);

  const handleVoucherPress = useCallback(
    (voucher: (typeof VOUCHERS)[0]) => {
      navigation.navigate(NAVIGATION_SCREENS.NEW_SCRATCH_CARD_SCREEN, {
        points: voucher.points,
        voucherId: voucher.id,
      });
    },
    [navigation],
  );

  return (
    <View>
      <RewardBalanceCard
        title="Reward Balance"
        balance={5.0}
        subtitle="Points: 102"
        subtitleColor={theme.colors.greyDark}
        showChevron
        onChevronPress={() => setDetailVisible(true)}
      />

      <View style={{ marginTop: theme.spacing.base }}>
        <DashboardSection title="Scratch Vouchers" actionText="See all">
          <View style={styles.voucherGrid}>
            {VOUCHERS.map(v => (
              <View key={v.id} style={styles.voucherHalf}>
                <ScratchVoucherCard
                  points={v.points}
                  onPress={() => handleVoucherPress(v)}
                />
              </View>
            ))}
          </View>
        </DashboardSection>
      </View>

      <RewardsDetailModal
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
      />
    </View>
  );
};

export default RewardsTab;
