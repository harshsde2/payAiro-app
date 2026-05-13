import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { USER_AUTH } from 'api/endpoints';
import { userApiClient } from 'api/userApiClient';
import { getDeviceFingerprint } from 'utils/getDeviceFingerprint';

type PaymentMethodCardType = 'DEBIT' | 'CREDIT' | string;

export type PaymentMethodItem = {
  payment_method_id: string;
  provider_id?: string;
  provider_name?: string;
  card_type?: PaymentMethodCardType;
  card_provider?: string;
  card_last4?: string;
  exp_month?: string;
  exp_year?: string;
  status?: string;
  buy_supported?: boolean;
  sell_supported?: boolean;
  billing_country?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip_code?: string;
  billing_first_name?: string;
  billing_last_name?: string;
};

type PaymentMethodsListResponse = {
  ok?: boolean;
  message?: string;
  data?: {
    total?: number;
    limit?: number;
    items?: PaymentMethodItem[];
  };
};

export type AddPaymentMethodRequest = {
  providerId: string;
  card: {
    cardNumber: string;
    month: string;
    year: string;
    cvv: string;
  };
  webSessionId?: string;
  paymentProcessAssociation: 'BUY' | 'SELL' | string;
};

type AddPaymentMethodResponse = {
  ok?: boolean;
  message?: string;
  data?: unknown;
};

export const paymentMethodKeys = {
  all: ['paymentMethods'] as const,
  list: (limit: number) => [...paymentMethodKeys.all, 'list', limit] as const,
};

export function usePaymentMethodsList(limit: number = 20) {
  return useQuery({
    queryKey: paymentMethodKeys.list(limit),
    queryFn: async () => {
      const url = `${USER_AUTH.PAYMENT_METHODS}?limit=${encodeURIComponent(String(limit))}`;
      return await userApiClient.get<PaymentMethodsListResponse>(url);
    },
    staleTime: 10_000,
  });
}

export function useAddPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddPaymentMethodRequest) => {
      // console.log("payload =>", JSON.stringify(payload, null, 2));
      const fingerprint = await getDeviceFingerprint();
      return await userApiClient.post<AddPaymentMethodResponse>(
        USER_AUTH.PAYMENT_METHODS,
        payload,
        false,
        {
          "x-device-fingerprint": fingerprint,
        }
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: paymentMethodKeys.all });
    },
  });
}

