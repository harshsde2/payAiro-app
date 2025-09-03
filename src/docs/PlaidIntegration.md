# Plaid Link Integration Guide

This guide explains how to use the Plaid Link integration in the payAiro app to connect external bank accounts.

## Overview

The Plaid integration allows users to securely connect their external bank accounts using Plaid's Link SDK. The integration includes:

- **PlaidLinkScreen**: A dedicated screen for the Plaid Link flow
- **PlaidLinkButton**: A reusable button component
- **usePlaidLink**: A custom hook for easy integration
- **API Integration**: Backend endpoints for token exchange

## Components

### 1. PlaidLinkScreen

The main screen that handles the Plaid Link flow.

**Location**: `src/screens/TSX-Screens/AddBalance/PlaidLinkScreen.tsx`

**Features**:
- Fetches Plaid link token from backend
- Opens Plaid Link SDK
- Handles success/error scenarios
- Exchanges public token for access token
- Updates bank account list after successful connection

**Usage**:
```typescript
import PlaidLinkScreen from 'screens/TSX-Screens/AddBalance/PlaidLinkScreen';

// Navigate to the screen
navigation.navigate(NAVIGATION_SCREENS.PLAID_LINK_SCREEN, {
  onSuccess: () => {
    // Handle successful connection
    console.log('Bank account connected!');
  },
  onCancel: () => {
    // Handle cancellation
    console.log('User cancelled');
  },
});
```

### 2. PlaidLinkButton

A reusable button component that opens the Plaid Link flow.

**Location**: `src/tsx-components/PlaidLinkButton.tsx`

**Props**:
- `onSuccess`: Callback when bank account is connected
- `onCancel`: Callback when user cancels
- `title`: Button text (default: "Connect Bank Account")
- `variant`: Button style ('primary', 'secondary', 'outline')
- `size`: Button size ('small', 'medium', 'large')
- `disabled`: Disable the button
- `loading`: Show loading state
- `style`: Custom styles
- `textStyle`: Custom text styles

**Usage**:
```typescript
import PlaidLinkButton from 'tsx-components/PlaidLinkButton';

<PlaidLinkButton
  title="+ Add External Bank Account"
  variant="outline"
  size="medium"
  onSuccess={() => {
    console.log('Bank account added successfully!');
    // Refresh bank list
  }}
  onCancel={() => {
    console.log('User cancelled');
  }}
/>
```

### 3. usePlaidLink Hook

A custom hook for easy Plaid Link integration.

**Location**: `src/hooks/usePlaidLink.ts`

**Usage**:
```typescript
import { usePlaidLink } from 'hooks/usePlaidLink';

const MyComponent = () => {
  const { openPlaidLink } = usePlaidLink({
    onSuccess: () => {
      console.log('Bank account connected!');
    },
    onCancel: () => {
      console.log('User cancelled');
    },
  });

  return (
    <TouchableOpacity onPress={openPlaidLink}>
      <Text>Connect Bank Account</Text>
    </TouchableOpacity>
  );
};
```

## API Integration

### Backend Endpoints

The integration uses these endpoints:

1. **Get Link Token**: `POST /kyc/plaid-kyc-linktoken`
   - Returns a Plaid link token for the Link SDK

2. **Exchange Access Token**: `POST /kyc/acesstoken`
   - Exchanges public token for access token
   - Body: `{ public_token: string, plaid_accountid: string }`

### API Types

**Location**: `src/api/types.ts`

```typescript
interface PlaidLinkTokenResponse {
  status: boolean;
  message: string;
  data: {
    plaid_link_token: string;
  };
}

interface PlaidAccessTokenRequest {
  public_token: string;
  plaid_accountid: string;
}

interface PlaidAccessTokenResponse {
  status: boolean;
  message: string;
  data: {
    access_token: string;
    item_id: string;
  };
}
```

### Query Hooks

**Location**: `src/query/hooks/useBank.ts`

```typescript
// Get Plaid link token
const { data: linkTokenData, isLoading, error } = usePlaidLinkToken();

// Exchange public token for access token
const { mutate: exchangeToken, isPending } = usePlaidAccessToken();
```

## Integration Examples

### 1. Add to AddBalance Screen

See `src/screens/TSX-Screens/AddBalance/AddBalanceWithPlaid.tsx` for a complete example.

```typescript
import PlaidLinkButton from 'tsx-components/PlaidLinkButton';

// Add this to your component
<View style={{ paddingHorizontal: 20, marginTop: 16 }}>
  <PlaidLinkButton
    title="+ Add External Bank Account"
    variant="outline"
    size="medium"
    onSuccess={() => {
      // Refresh bank accounts list
      console.log('External bank account added!');
    }}
  />
</View>
```

### 2. Add to Settings Screen

```typescript
import { usePlaidLink } from 'hooks/usePlaidLink';

const SettingsScreen = () => {
  const { openPlaidLink } = usePlaidLink({
    onSuccess: () => {
      // Show success message
      Alert.alert('Success', 'Bank account connected successfully!');
    },
  });

  return (
    <TouchableOpacity onPress={openPlaidLink}>
      <Text>Connect Bank Account</Text>
    </TouchableOpacity>
  );
};
```

### 3. Add to Dashboard

```typescript
import PlaidLinkButton from 'tsx-components/PlaidLinkButton';

const Dashboard = () => {
  return (
    <View>
      <PlaidLinkButton
        title="Connect New Bank"
        variant="primary"
        size="large"
        onSuccess={() => {
          // Refresh dashboard data
          queryClient.invalidateQueries(['bank']);
        }}
      />
    </View>
  );
};
```

## Flow Diagram

```
User clicks "Connect Bank Account"
           ↓
    Navigate to PlaidLinkScreen
           ↓
    Fetch link token from backend
           ↓
    Open Plaid Link SDK
           ↓
    User selects bank & logs in
           ↓
    Plaid returns public token
           ↓
    Exchange public token for access token
           ↓
    Backend stores access token
           ↓
    Refresh bank accounts list
           ↓
    Show success message
```

## Error Handling

The integration includes comprehensive error handling:

1. **Token Fetch Errors**: Shows retry button
2. **Plaid Link Errors**: Displays error message from Plaid
3. **Token Exchange Errors**: Shows error alert with retry option
4. **Network Errors**: Handles connectivity issues

## Security Considerations

1. **Token Management**: Access tokens are stored securely on the backend
2. **Read-Only Access**: Plaid only requests read-only access to accounts
3. **Encryption**: All communication is encrypted
4. **Token Expiration**: Tokens are managed and refreshed as needed

## Testing

### Sandbox Mode

The integration works with Plaid's sandbox environment for testing:

- Use test credentials provided by Plaid
- Test with various bank scenarios
- Verify error handling with invalid credentials

### Production Mode

For production:

1. Update Plaid configuration to production
2. Test with real bank credentials
3. Verify all error scenarios
4. Test with different bank types

## Troubleshooting

### Common Issues

1. **Link Token Not Loading**
   - Check network connectivity
   - Verify backend endpoint is working
   - Check authentication token

2. **Plaid Link Not Opening**
   - Verify Plaid SDK is properly configured
   - Check iOS/Android specific setup
   - Ensure link token is valid

3. **Token Exchange Failing**
   - Verify public token format
   - Check account ID extraction
   - Ensure backend endpoint is working

### Debug Logs

Enable debug logging by setting `logLevel: LinkLogLevel.DEBUG` in the Plaid configuration.

## Dependencies

- `react-native-plaid-link-sdk`: ^12.0.3
- `@tanstack/react-query`: For API state management
- `react-navigation`: For navigation

## Support

For issues with the Plaid integration:

1. Check the Plaid documentation
2. Review error logs in the console
3. Test with Plaid's sandbox environment
4. Contact the development team
