import { useMemo } from "react";
import { IBankBalance, ICryptoBalance, ITabItem } from "../types";

interface UseCryptoFilteringProps {
  bankBalance: IBankBalance;
  selectedTab: ITabItem;
  selectedIRAValue: number;
  cryptoPricesData: any;
}

export const useCryptoFiltering = ({
  bankBalance,
  selectedTab,
  selectedIRAValue,
  cryptoPricesData,
}: UseCryptoFilteringProps) => {
  
  // Get balance for a specific crypto from the appropriate account
  const getCryptoBalance = useMemo(() => (currency: string) => {
    if (!bankBalance) return 0;
    
    const lowerCurrency = currency.toLowerCase();
    
    if (selectedTab.title === "All") {
      // Sum from all accounts
      const bankAmount = bankBalance.bank_account?.[lowerCurrency] || 0;
      const rothAmount = bankBalance.roth_ira_account?.[lowerCurrency] || 0;
      const traditionalAmount = bankBalance.traditional_ira_account?.[lowerCurrency] || 0;
      return bankAmount + rothAmount + traditionalAmount;
    } else {
      // Get from selected account only
      if (selectedIRAValue === 0) {
        // Roth IRA
        return bankBalance.roth_ira_account?.[lowerCurrency] || 0;
      } else {
        // Traditional IRA
        return bankBalance.traditional_ira_account?.[lowerCurrency] || 0;
      }
    }
  }, [bankBalance, selectedTab, selectedIRAValue]);

  // Get filtered crypto data based on selection (simplified)
  const filteredCryptoData = useMemo(() => {
    console.log("🔍 useCryptoFiltering - bankBalance:", JSON.stringify(bankBalance, null, 2));
    console.log("🔍 useCryptoFiltering - selectedTab:", selectedTab?.title);
    console.log("🔍 useCryptoFiltering - selectedIRAValue:", selectedIRAValue);
    
    if (!bankBalance) {
      console.log("❌ No bankBalance data");
      return [];
    }

    // Extract all crypto currencies from all accounts
    const allCryptos = new Set<string>();
    
    [bankBalance.bank_account, bankBalance.roth_ira_account, bankBalance.traditional_ira_account].forEach(account => {
      if (account) {
        Object.keys(account).forEach(key => {
          if (key !== 'usd' && account[key] > 0) {
            allCryptos.add(key.toUpperCase());
          }
        });
      }
    });

    const cryptoBalances = Array.from(allCryptos).map(currency => ({
      currency,
      amount: getCryptoBalance(currency),
      accountType: selectedTab.title === "All" ? 'all' as const : 
                  selectedIRAValue === 0 ? 'roth_ira_account' as const : 'traditional_ira_account' as const,
    }));

    console.log("✅ Final cryptoBalances:", cryptoBalances);
    return cryptoBalances;
  }, [bankBalance, selectedTab, selectedIRAValue, getCryptoBalance]);

  // Transform crypto balances to match the expected format for rendering
  const transformedCryptoData = useMemo(() => {
    console.log("🔍 cryptoPricesData:", cryptoPricesData);
    console.log("🔍 filteredCryptoData:", filteredCryptoData);
    
    if (!cryptoPricesData?.data || !Array.isArray(cryptoPricesData.data)) {
      console.log("❌ No cryptoPricesData or not array");
      return filteredCryptoData.length > 0 ? filteredCryptoData.map(crypto => ({
        currency: crypto.currency,
        balance: crypto.amount,
        accountType: crypto.accountType,
      })) : [];
    }

    return cryptoPricesData.data.map((cryptoItem: any) => {
      const balance = getCryptoBalance(cryptoItem.currency);
      return {
        ...cryptoItem,
        balance,
        accountType: selectedTab.title === "All" ? 'all' : 
                    selectedIRAValue === 0 ? 'roth_ira_account' : 'traditional_ira_account',
      };
    });
  }, [cryptoPricesData, selectedTab, selectedIRAValue, bankBalance, getCryptoBalance]);

  // Always show crypto section if we have crypto price data OR if we have any crypto balances
  const hasCryptoData = (cryptoPricesData?.data && Array.isArray(cryptoPricesData.data) && cryptoPricesData.data.length > 0) || filteredCryptoData.length > 0;
  
  console.log("🎯 Final results - hasCryptoData:", hasCryptoData);
  console.log("🎯 Final results - transformedCryptoData:", transformedCryptoData);

  return {
    filteredCryptoData,
    transformedCryptoData,
    hasCryptoData,
  };
};
