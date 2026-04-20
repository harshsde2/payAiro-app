import React from 'react'
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper'
import CryptoAssetsList from '@new-ui/components/common-components/CryptoAssetsList'
import { useCryptoAssetsListData } from 'query/hooks/useCrypto'
import { useTheme as useNewUITheme } from '@new-ui/styles/ThemeContext'
import CustomText from 'new-ui/components/common-components/CustomText'
import DashboardSection from 'tsx-components/DashboardSection'
import DashboardHeader from 'new-ui/components/common-components/DashboardHeader'

const NewCrypto = () => {
  const { theme: newUITheme } = useNewUITheme();
  const { data: balances = [], isMarketLoading: isLoading } =
    useCryptoAssetsListData("USD");

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["bottom", "top"]}
      scrollable
      contentStyle={{ flexGrow: 1, paddingBottom: 80, paddingHorizontal: 15 }}
      gradient="linear"
      gradientColors={[
        newUITheme.colors.greenLight2,
        newUITheme.colors.greenLight2,
        newUITheme.colors.white,
        newUITheme.colors.greenLight2,
        newUITheme.colors.greenLight1,
        newUITheme.colors.tertiary,
        newUITheme.colors.greenLight1,
        newUITheme.colors.greenLight2,
        newUITheme.colors.white,
      ]}
      gradientStart={{ x: 1, y: 1 }}
      gradientEnd={{ x: 0, y: 0 }}
    >
      <DashboardHeader style={{ marginBottom: 10, marginHorizontal: 15, }} />
      <DashboardSection title='Crypto Assets'>
        <CryptoAssetsList data={balances} isLoading={isLoading} />
      </DashboardSection>
    </ScreenWrapper>
  )
}

export default NewCrypto
