export const queryKeys = {
  user: {
    all: ["user"] as const,
    contacts: () => [...queryKeys.user.all, "contacts"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
    notifications: () => [...queryKeys.user.all, "notifications"] as const,
    pin: () => [...queryKeys.user.all, "pin"] as const,
    fiatDashboard: () => [...queryKeys.user.all, "fiat_dashboard"] as const,
    walletDashboard: () => [...queryKeys.user.all, "wallet_dashboard"] as const,
  },
  crypto: {
    all: ["crypto"] as const,
    cryptoBalance: () => [...queryKeys.crypto.all, "cryptoBalance"] as const,
    cryptoBalanceFortress: () => [...queryKeys.crypto.all, "cryptoBalanceFortress"] as const,
    cryptoBalanceByAsset: (asset: string) => [...queryKeys.crypto.all, "cryptoBalanceByAsset", asset] as const,
    allCryptoBalances: () => [...queryKeys.crypto.all, "allCryptoBalances"] as const,
    trades: () => [...queryKeys.crypto.all, "trades"] as const,
    prices: () => [...queryKeys.crypto.all, "prices"] as const,
  },
  wallet: {
    all: ["wallet"] as const,
    details: () => [...queryKeys.wallet.all, "details"] as const,
    balance: () => [...queryKeys.wallet.all, "balance"] as const,
    transactions: () => [...queryKeys.wallet.all, "transactions"] as const,
    filteredTransactions: () => [...queryKeys.wallet.all, "filteredTransactions"] as const,
  },
  bank: {
    all: ["bank"] as const,
    accounts: () => [...queryKeys.bank.all, "accounts"] as const,
    allAccounts: () => [...queryKeys.bank.all, "allAccounts"] as const,
    balances: () => [...queryKeys.bank.all, "balances"] as const,
  },
  rewards: {
    all: ["rewards"] as const,
    myRewards: () => [...queryKeys.rewards.all, "myRewards"] as const,
  },
  rwa: {
    all: ["rwa"] as const,
    list: () => [...queryKeys.rwa.all, "list"] as const,
    holdings: () => [...queryKeys.rwa.all, "holdings"] as const,
    iraHoldings: () => [...queryKeys.rwa.all, "iraHoldings"] as const,
  },
  kyc: {
    all: ["kyc"] as const,
    status: () => [...queryKeys.kyc.all, "status"] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    history: () => [...queryKeys.transactions.all, "history"] as const,
    filtered: () => [...queryKeys.transactions.all, "filtered"] as const,
  },
};
