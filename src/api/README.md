# Robust API Structure

This API structure provides a clean, consistent, and easy-to-use way to make API calls with React Query and Redux integration.

## Features

1. **Pre-defined Hooks**: Easy-to-use hooks for GET, POST, PATCH, DELETE requests
2. **Redux Integration**: Automatically sync API responses to Redux state
3. **Consistent Response Format**: Standardized data and error responses
4. **Proper Interceptors**: Clean request/response interceptors with error handling
5. **Type Safety**: Full TypeScript support

## Usage Examples

### Basic GET Request

```typescript
import { useGet } from "@api/hooks";
import { AUTH } from "@api/endpoints";
import { queryKeys } from "@query/queryKeys";

const { data, isLoading, error } = useGet<User[]>({
  queryKey: queryKeys.user.contacts(),
  endpoint: AUTH.CONTACT_GET,
});

// Access data
if (data?.success) {
  const contacts = data.data; // User[]
} else {
  const errorMessage = data?.error?.message;
}
```

### Basic POST Request

```typescript
import { usePost } from "@api/hooks";
import { AUTH } from "@api/endpoints";

const loginMutation = usePost<any, LoginPayload>({
  endpoint: AUTH.LOGIN,
  isFormData: true,
});

// Use in component
const handleLogin = async () => {
  const result = await loginMutation.mutateAsync({
    email: "user@example.com",
    otp: "123456",
  });
  
  if (result.success) {
    // Handle success
    console.log(result.data);
  } else {
    // Handle error
    console.error(result.error?.message);
  }
};
```

### POST with Redux Sync

```typescript
import { usePost } from "@api/hooks";
import { setUserData } from "@redux/slices/userSlice";

const updateProfileMutation = usePost<User, UpdateProfilePayload>({
  endpoint: AUTH.UPDATE_ACCOUNT,
  isFormData: true,
  syncToRedux: {
    action: setUserData(null),
    selector: (data) => data, // Optional: transform data before syncing
  },
  onSuccess: (data) => {
    console.log("Profile updated:", data.data);
  },
});
```

### PATCH Request

```typescript
import { usePatch } from "@api/hooks";

const updateMutation = usePatch<any, UpdatePayload>({
  endpoint: AUTH.UPDATE_ACCOUNT,
  isFormData: true,
});
```

### DELETE Request

```typescript
import { useDelete } from "@api/hooks";

const deleteMutation = useDelete<any>({
  endpoint: AUTH.DELETE_ACCOUNT,
});
```

### Advanced: GET with Conditional Fetching

```typescript
const { data, isLoading } = useGet<any>({
  queryKey: queryKeys.user.pin(),
  endpoint: AUTH.GET_PIN,
  enabled: shouldFetch, // Conditionally enable/disable
  staleTime: 1000,
  refetchOnMount: true,
});
```

### Advanced: POST with Query Invalidation

```typescript
import { useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

const addContactMutation = usePost<any, AddContactPayload>({
  endpoint: AUTH.CONTACT_ADDING,
  onSuccess: () => {
    // Invalidate and refetch contacts
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.user.contacts() 
    });
  },
});
```

## Response Format

All API responses follow a consistent format:

```typescript
interface StandardApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  statusCode: number;
}
```

### Success Response
```typescript
{
  success: true,
  data: { /* your data */ },
  error: null,
  statusCode: 200
}
```

### Error Response
```typescript
{
  success: false,
  data: null,
  error: {
    status: false,
    message: "Error message",
    toast_message: "User-friendly message",
    code: 400
  },
  statusCode: 400
}
```

## Redux Integration

To sync API responses to Redux:

```typescript
import { setUserData } from "@redux/slices/userSlice";

useGet<User>({
  queryKey: queryKeys.user.profile(),
  endpoint: AUTH.PROFILE,
  syncToRedux: {
    action: setUserData(null), // Redux action
    selector: (data) => data, // Optional: transform data
  },
});
```

## Error Handling

Errors are automatically formatted and available in the response:

```typescript
const { data, error } = useGet<User[]>({
  queryKey: queryKeys.user.contacts(),
  endpoint: AUTH.CONTACT_GET,
});

if (!data?.success) {
  // Handle error
  const errorMessage = data?.error?.message;
  const toastMessage = data?.error?.toast_message;
}
```

## Migration from Old API Client

### Old Way
```typescript
const { data } = useQuery({
  queryKey: ["contacts"],
  queryFn: async () => {
    return await apiClient.get<ApiResponse<User[]>>(AUTH.CONTACT_GET);
  },
});
```

### New Way
```typescript
const { data } = useGet<User[]>({
  queryKey: queryKeys.user.contacts(),
  endpoint: AUTH.CONTACT_GET,
});

// Access data
if (data?.success) {
  const contacts = data.data;
}
```

## Best Practices

1. **Always use query keys from `queryKeys`**: Centralized key management
2. **Use TypeScript types**: Define payload and response types
3. **Handle errors**: Check `data?.success` before accessing `data.data`
4. **Use Redux sync**: For data that needs to be in global state
5. **Invalidate queries**: After mutations that affect related queries

