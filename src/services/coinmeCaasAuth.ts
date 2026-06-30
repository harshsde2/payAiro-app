import { USER_AUTH } from 'api/endpoints';
import { userApiClient } from 'api/userApiClient';

/**
 * Coinme CaaS partner authorization token, fetched from OUR backend.
 *
 * The Vault SDK's POST `/services/paymentmethods` requires the Coinme partner Bearer JWT, and
 * Coinme's vault route does NOT inject it. Rather than holding the partner secret in the app,
 * the backend exposes `GET api/v1/integrations/coinme/auth-token/` (authenticated with the user
 * JWT, injected by `userApiClient`) and returns a short-lived Coinme token. We fetch it fresh
 * before each card submit and pass it straight into the vault submit headers.
 */

type CoinmeAuthTokenResponse =
  | string
  | {
      access_token?: string;
      token?: string;
      data?: { access_token?: string; token?: string };
    };

/** Pulls the token string out of the backend response, tolerating a few likely shapes. */
const extractToken = (res: CoinmeAuthTokenResponse | null | undefined): string => {
  if (!res) return '';
  if (typeof res === 'string') return res.trim();
  return (
    res.access_token ||
    res.token ||
    res.data?.access_token ||
    res.data?.token ||
    ''
  ).trim();
};

/**
 * Fetch a fresh Coinme CaaS Bearer token from the backend. Throws when the backend call fails or
 * returns no token, so the caller can surface a clear error.
 */
export async function fetchCoinmeCaasAuthToken(): Promise<string> {
  const res = await userApiClient.get<CoinmeAuthTokenResponse>(USER_AUTH.COINME_AUTH_TOKEN);
  const token = extractToken(res);
  if (!token) {
    throw new Error('Could not get a Coinme authorization token. Please try again.');
  }
  return token;
}
