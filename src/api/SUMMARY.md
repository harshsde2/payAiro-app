# API Structure Implementation Summary

## ✅ Completed Features

### 1. Robust API Client (`src/api/client.ts`)
- ✅ Proper interceptors for request/response handling
- ✅ Consistent error formatting
- ✅ KYC gating logic preserved
- ✅ Token injection from storage
- ✅ Standardized response format (`StandardApiResponse`)

### 2. Generic Hooks (`src/api/hooks/`)
- ✅ `useGet` - For GET requests
- ✅ `usePost` - For POST requests (can also handle PATCH/DELETE via method prop)
- ✅ `usePatch` - For PATCH requests
- ✅ `useDelete` - For DELETE requests
- ✅ All hooks support React Query options
- ✅ Type-safe with TypeScript

### 3. Redux Integration
- ✅ `syncToRedux` option in hooks
- ✅ Automatic data syncing to Redux state
- ✅ Optional data transformation via `selector`

### 4. Consistent Response Format
- ✅ `StandardApiResponse<T>` for all API calls
- ✅ Unified error structure (`ApiError`)
- ✅ Same format for success and error responses

### 5. Query Keys Structure (`src/query/queryKeys.ts`)
- ✅ Centralized query key management
- ✅ Organized by feature (user, crypto, wallet, etc.)
- ✅ Type-safe query keys

### 6. Refactored Hooks
- ✅ `useUser.ts` - Migrated to new structure
- ✅ `useAPIAuth.ts` - Migrated to new structure

## 📋 Files Created

1. `src/api/client.ts` - New API client with interceptors
2. `src/api/hooks/useGet.ts` - GET hook
3. `src/api/hooks/usePost.ts` - POST hook
4. `src/api/hooks/usePatch.ts` - PATCH hook
5. `src/api/hooks/useDelete.ts` - DELETE hook
6. `src/api/hooks/types.ts` - Type definitions
7. `src/api/hooks/index.ts` - Exports
8. `src/api/types.ts` - Updated with StandardApiResponse
9. `src/api/index.ts` - Updated exports
10. `src/query/queryKeys.ts` - Centralized query keys
11. `src/api/README.md` - Usage documentation
12. `src/api/MIGRATION.md` - Migration guide

## 🔄 Files Updated

1. `src/api/types.ts` - Added StandardApiResponse and ApiError
2. `src/api/index.ts` - Updated to export new structure
3. `src/query/hooks/useUser.ts` - Migrated to new hooks
4. `src/query/hooks/useAPIAuth.ts` - Migrated to new hooks
5. `src/query/queryKeys.ts` - Replaced old queryKeys

## ⚠️ Files That Still Need Migration

The following hooks still use the old API structure and should be migrated:

1. `src/query/hooks/useWallet.ts`
2. `src/query/hooks/useTransactions.ts`
3. `src/query/hooks/useRewards.ts`
4. `src/query/hooks/useCrypto.ts`
5. `src/query/hooks/useBank.ts`
6. `src/query/hooks/useContact.ts`
7. `src/query/hooks/useRWA.ts`
8. `src/query/hooks/useMxIntegration.ts`
9. `src/query/hooks/useKycStatusPolling.ts`

## 📖 Usage Examples

### Basic GET Request
```typescript
import { useGet } from "@api/hooks";
import { queryKeys } from "@query/queryKeys";

const { data, isLoading } = useGet<User[]>({
  queryKey: queryKeys.user.contacts(),
  endpoint: AUTH.CONTACT_GET,
});

if (data?.success) {
  const contacts = data.data;
}
```

### POST with Redux Sync
```typescript
import { usePost } from "@api/hooks";
import { setUserData } from "@redux/slices/userSlice";

const mutation = usePost<User, LoginPayload>({
  endpoint: AUTH.LOGIN,
  isFormData: true,
  syncToRedux: {
    action: setUserData(null),
  },
});
```

### Error Handling
```typescript
const { data } = useGet<User[]>({
  queryKey: queryKeys.user.contacts(),
  endpoint: AUTH.CONTACT_GET,
});

if (!data?.success) {
  const errorMessage = data?.error?.message;
  const toastMessage = data?.error?.toast_message;
}
```

## 🎯 Key Benefits

1. **Easier API Calls**: Just use pre-defined hooks
2. **Redux Integration**: Automatic syncing with `syncToRedux`
3. **Consistent Format**: Same response structure everywhere
4. **Type Safety**: Full TypeScript support
5. **Error Handling**: Standardized error format
6. **Less Boilerplate**: No need to write queryFn repeatedly

## 📝 Next Steps

1. Migrate remaining hooks to use new structure
2. Update components using old hooks
3. Test all API calls with new structure
4. Remove old API client code (if desired)

## 🔍 Important Notes

- The new `apiClient` returns `StandardApiResponse<T>` instead of raw data
- Always check `data?.success` before accessing `data.data`
- Use `queryKeys` from `@query/queryKeys` for consistency
- Redux sync is optional but recommended for global state

