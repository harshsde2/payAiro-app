# API Migration Guide

## Overview

The API structure has been refactored to provide:
- Consistent response format (`StandardApiResponse`)
- Pre-defined hooks (`useGet`, `usePost`, `usePatch`, `useDelete`)
- Redux integration
- Proper error handling

## Breaking Changes

### Response Format Change

**Old Format:**
```typescript
const response = await apiClient.get<ApiResponse<User[]>>(endpoint);
// response is ApiResponse<User[]>
```

**New Format:**
```typescript
const response = await apiClient.get<User[]>(endpoint);
// response is StandardApiResponse<User[]>
// Access data: response.data (if response.success === true)
// Access error: response.error (if response.success === false)
```

### Hook Usage Change

**Old Way:**
```typescript
const { data } = useQuery<ApiResponse<User[]>>({
  queryKey: ["contacts"],
  queryFn: async () => {
    return await apiClient.get<ApiResponse<User[]>>(AUTH.CONTACT_GET);
  },
});
// data is ApiResponse<User[]>
```

**New Way:**
```typescript
const { data } = useGet<User[]>({
  queryKey: queryKeys.user.contacts(),
  endpoint: AUTH.CONTACT_GET,
});
// data is StandardApiResponse<User[]> | undefined
// Access: data?.data (if data?.success)
```

## Migration Steps

### Step 1: Update Imports

```typescript
// Old
import { apiClient } from "../../api";
import { useQuery, useMutation } from "@tanstack/react-query";

// New
import { useGet, usePost, usePatch, useDelete } from "@api/hooks";
import { queryKeys } from "@query/queryKeys";
```

### Step 2: Update GET Requests

```typescript
// Old
export const useWalletDetails = () => {
  return useQuery<ApiResponse<Wallet>>({
    queryKey: walletKeys.details(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<Wallet>>(WALLET.DETAILS);
    },
  });
};

// New
export const useWalletDetails = () => {
  return useGet<Wallet>({
    queryKey: queryKeys.wallet.details(),
    endpoint: WALLET.DETAILS,
  });
};
```

### Step 3: Update POST/PATCH/DELETE Requests

```typescript
// Old
export const useRedeemReward = () => {
  return useMutation<ApiResponse<any>, Error, RedeemPayload>({
    mutationFn: async ({ payload, value }) => {
      const response = await apiClient.patch<ApiResponse<any>>(
        `${AUTH.REDEEM_REWARD}${value}/`,
        { redeem: true },
        true
      );
      return response.data;
    },
  });
};

// New
export const useRedeemReward = () => {
  return usePatch<any, RedeemPayload>({
    endpoint: (variables) => `${AUTH.REDEEM_REWARD}${variables.value}/`,
    isFormData: true,
    mutationFn: async (variables) => {
      return { redeem: true };
    },
  });
};
```

**Note:** For dynamic endpoints, you may need to handle them differently:

```typescript
// For dynamic endpoints, use a function
export const useRedeemReward = () => {
  return usePatch<any, RedeemPayload>({
    endpoint: AUTH.REDEEM_REWARD, // Base endpoint
    isFormData: true,
    // Handle dynamic path in mutationFn or use a wrapper
  });
};
```

### Step 4: Update Data Access

```typescript
// Old
const { data } = useWalletDetails();
if (data?.status) {
  const wallet = data.data;
}

// New
const { data } = useWalletDetails();
if (data?.success && data.data) {
  const wallet = data.data;
} else if (!data?.success) {
  const errorMessage = data?.error?.message;
}
```

### Step 5: Add Redux Sync (Optional)

```typescript
import { setWalletData } from "@redux/slices/walletSlice";

export const useWalletDetails = () => {
  return useGet<Wallet>({
    queryKey: queryKeys.wallet.details(),
    endpoint: WALLET.DETAILS,
    syncToRedux: {
      action: setWalletData(null),
      selector: (data) => data, // Optional transformation
    },
  });
};
```

## Files That Need Migration

The following files still use the old API structure and need to be migrated:

1. `src/query/hooks/useWallet.ts`
2. `src/query/hooks/useTransactions.ts`
3. `src/query/hooks/useRewards.ts`
4. `src/query/hooks/useCrypto.ts`
5. `src/query/hooks/useBank.ts`
6. `src/query/hooks/useContact.ts`
7. `src/query/hooks/useRWA.ts`
8. `src/query/hooks/useMxIntegration.ts`

## Already Migrated

- ✅ `src/query/hooks/useUser.ts`
- ✅ `src/query/hooks/useAPIAuth.ts`

## Tips

1. **Always check `data?.success`** before accessing `data.data`
2. **Use query keys from `queryKeys`** instead of creating new ones
3. **Handle errors** using `data?.error?.message` or `data?.error?.toast_message`
4. **Use Redux sync** for data that needs to be in global state
5. **Invalidate queries** after mutations using `queryClient.invalidateQueries()`

## Example: Complete Migration

```typescript
// Before
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api";
import { ApiResponse, Wallet } from "../../api/types";

export const walletKeys = {
  all: ["wallet"] as const,
  details: () => [...walletKeys.all, "details"] as const,
};

export const useWalletDetails = () => {
  return useQuery<ApiResponse<Wallet>>({
    queryKey: walletKeys.details(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<Wallet>>(WALLET.DETAILS);
    },
  });
};

// After
import { useGet } from "@api/hooks";
import { queryKeys } from "@query/queryKeys";
import { Wallet } from "@api/types";
import { WALLET } from "@api/endpoints";

export const useWalletDetails = () => {
  return useGet<Wallet>({
    queryKey: queryKeys.wallet.details(),
    endpoint: WALLET.DETAILS,
  });
};
```

