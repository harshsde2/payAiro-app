/**
 * Crypto Request (P2P) React Query hooks.
 *
 * Follows the patterns in `useCrypto.ts` (co-located query-key factory, typed
 * useQuery/useMutation, `userApiClient` for FastAPI). All endpoints are JWT
 * authenticated — Bearer injection + refresh are handled by `userApiClient`.
 */
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { userApiClient } from "api/userApiClient";
import { USER_AUTH } from "../../api/endpoints";
import { queryStaleTime } from "query/queryConfigs";
import { cryptoKeys } from "./useCrypto";
import type {
  CryptoRequestScope,
  CryptoRequestStatus,
  ICreateCryptoRequestPayload,
  ICryptoRequest,
  ICryptoRequestEnvelope,
  ICryptoRequestHistoryEnvelope,
  IPayCryptoRequestEnvelope,
} from "./cryptoRequest.types";

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------
export const cryptoRequestKeys = {
  all: ["cryptoRequest"] as const,
  history: (scope: CryptoRequestScope, status: string, limit: number) =>
    [...cryptoRequestKeys.all, "history", scope, status, limit] as const,
};

/** Invalidate every crypto-request query + the unified send/activity history. */
function invalidateRequestQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: cryptoRequestKeys.all });
  queryClient.invalidateQueries({ queryKey: cryptoKeys.all });
}

/**
 * The FastAPI request endpoints can return **HTTP 200 with a populated
 * `errorResponse`** (and `data: null`) on failure — e.g. "Insufficient wallet
 * balance". Since `userApiClient` resolves any 2xx as success, we must inspect
 * the body and throw so React Query routes it to `onError`/callers instead of
 * treating a failure as success. The thrown envelope is parsed by
 * `getCryptoRequestError`.
 */
function throwIfApiError<T extends { errorResponse?: unknown }>(res: T): T {
  const errorResponse = res?.errorResponse as
    | { errorData?: Array<{ errorCode?: string; message?: string }> }
    | null
    | undefined;
  if (errorResponse && errorResponse.errorData && errorResponse.errorData.length > 0) {
    const err = new Error(
      errorResponse.errorData[0]?.message || "Request failed."
    ) as Error & { errorResponse?: unknown };
    err.errorResponse = errorResponse;
    throw err;
  }
  return res;
}

// ---------------------------------------------------------------------------
// Create a request
// ---------------------------------------------------------------------------
export const useCreateCryptoRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<ICryptoRequestEnvelope, any, ICreateCryptoRequestPayload>({
    mutationFn: async (payload) =>
      throwIfApiError(
        await userApiClient.post<ICryptoRequestEnvelope>(
          USER_AUTH.CRYPTO_REQUEST_CREATE,
          payload
        )
      ),
    onSuccess: () => invalidateRequestQueries(queryClient),
  });
};

// ---------------------------------------------------------------------------
// History (filterable)
// ---------------------------------------------------------------------------
export const useCryptoRequestHistory = (
  scope: CryptoRequestScope = "received",
  status?: CryptoRequestStatus,
  limit: number = 50,
  options?: Partial<UseQueryOptions<ICryptoRequestHistoryEnvelope>>
) => {
  return useQuery<ICryptoRequestHistoryEnvelope>({
    queryKey: cryptoRequestKeys.history(scope, status ?? "", limit),
    queryFn: () => {
      const params = new URLSearchParams({ scope, limit: String(limit) });
      if (status) params.set("status", status);
      return userApiClient.get<ICryptoRequestHistoryEnvelope>(
        `${USER_AUTH.CRYPTO_REQUEST_HISTORY}?${params.toString()}`
      );
    },
    staleTime: queryStaleTime.INSTANT_STALE_TIME,
    ...options,
  });
};

/**
 * Pending requests aimed at me — drives the Activity banner count and the
 * default list view.
 */
export const usePendingIncomingCryptoRequests = () =>
  useCryptoRequestHistory("received", "PENDING", 50);

/**
 * Resolve a single request by id for deep-link / notification entry where only
 * the id is known. There is no GET-by-id endpoint, so we scan the `all` scope
 * history and find the match client-side.
 */
export const useCryptoRequestById = (
  id: number | string | undefined,
  options?: Partial<UseQueryOptions<ICryptoRequestHistoryEnvelope>>
) => {
  const query = useCryptoRequestHistory("all", undefined, 50, {
    enabled: id != null,
    ...options,
  });
  const numericId = Number(id);
  const request: ICryptoRequest | undefined = query.data?.data?.items?.find(
    (item) => Number(item.id) === numericId
  );
  return { ...query, request };
};

// ---------------------------------------------------------------------------
// Pay (fulfill) a request — empty body
// ---------------------------------------------------------------------------
export const usePayCryptoRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IPayCryptoRequestEnvelope,
    any,
    { requestId: number | string; idempotencyKey: string }
  >({
    // Moves real money — never auto-retry (see queryClient.ts).
    retry: 0,
    mutationFn: async ({ requestId, idempotencyKey }) =>
      throwIfApiError(
        await userApiClient.post<IPayCryptoRequestEnvelope>(
          USER_AUTH.CRYPTO_REQUEST_PAY(requestId),
          {},
          false,
          { "Idempotency-Key": idempotencyKey }
        )
      ),
    onSuccess: () => invalidateRequestQueries(queryClient),
  });
};

// ---------------------------------------------------------------------------
// Cancel / decline a request — empty body
// ---------------------------------------------------------------------------
export const useCancelCryptoRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<ICryptoRequestEnvelope, any, number | string>({
    mutationFn: async (requestId) =>
      throwIfApiError(
        await userApiClient.post<ICryptoRequestEnvelope>(
          USER_AUTH.CRYPTO_REQUEST_CANCEL(requestId),
          {}
        )
      ),
    onSuccess: () => invalidateRequestQueries(queryClient),
  });
};
