import React, { useMemo } from 'react'
import { View } from 'react-native'
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper'
import CryptoAssetsList from '@new-ui/components/common-components/CryptoAssetsList'
import DashboardBalanceCard from 'new-ui/components/common-components/DashboardBalanceCard'
import { useCryptoAssetsListData } from 'query/hooks/useCrypto'
import { useStateStablecoin } from 'hooks/useStateStablecoin'
import { useUserStateCode } from 'hooks/useUserStateCode'
import { useTheme as useNewUITheme } from '@new-ui/styles/ThemeContext'
import CustomText from 'new-ui/components/common-components/CustomText'
import DashboardSection from 'tsx-components/DashboardSection'
import DashboardHeader from 'new-ui/components/common-components/DashboardHeader'

const NewCrypto = () => {
  const { theme: newUITheme } = useNewUITheme();
  const {
    data: balances = [],
    isMarketLoading: isLoading,
    isRefetchingCrypto,
    refetchMarket,
    refetchBalance,
  } = useCryptoAssetsListData("USD");

  // The registered-state stablecoin (TX → DAI, others → USDC) is shown separately as
  // the "PayAiro Balance" on the dashboard, so it's excluded here to avoid double-counting.
  const stateStablecoin = useStateStablecoin();
  const totalCryptoBalance = useMemo(
    () =>
      balances.reduce((sum, row) => {
        if (String(row?.asset ?? '').toUpperCase() === stateStablecoin) return sum;
        const value = Number(row?.usd_value_available ?? 0);
        return Number.isFinite(value) ? sum + value : sum;
      }, 0),
    [balances, stateStablecoin]
  );

  // Display-only stablecoin hiding for the assets list (does NOT touch the balance
  // card total above): hide USDC in every state; also hide DAI for TX.
  const isTexas = (useUserStateCode() as string | null) === 'TX';
  const displayBalances = useMemo(
    () =>
      balances.filter((row) => {
        const sym = String(row?.asset ?? '').toUpperCase();
        if (sym === 'USDC') return false;
        if (isTexas && sym === 'DAI') return false;
        return true;
      }),
    [balances, isTexas]
  );

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["bottom", "top"]}
      scrollable
      contentStyle={{ flexGrow: 1, paddingBottom: 80,}}
      gradient="linear"
      gradientColors={[
        newUITheme.colors.greenLight2,
        newUITheme.colors.greenLight2,
        newUITheme.colors.background,
        newUITheme.colors.greenLight2,
        newUITheme.colors.greenLight1,
        newUITheme.colors.tertiary,
        newUITheme.colors.greenLight1,
        newUITheme.colors.greenLight2,
        newUITheme.colors.background,
      ]}
      gradientStart={{ x: 1, y: 1 }}
      gradientEnd={{ x: 0, y: 0 }}
    >
      <DashboardHeader style={{ marginBottom: 10, marginHorizontal: 15, }} />
      <View style={{ justifyContent: 'center', alignItems: 'center' ,marginTop: 5}}>
        <DashboardBalanceCard
          title="Total Crypto Balance"
          balance={totalCryptoBalance}
          isRefreshing={isRefetchingCrypto}
          onRefreshBalance={async () => {
            await Promise.all([refetchMarket(), refetchBalance()]);
          }}
          showActionButtons={false}
        />

      </View>
      <DashboardSection title='Crypto Assets' style={{ paddingHorizontal: 15 }}>
        <CryptoAssetsList data={displayBalances} isLoading={isLoading} />
      </DashboardSection>
    </ScreenWrapper>
  )
}

export default NewCrypto
