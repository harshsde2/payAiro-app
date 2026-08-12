import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { FAQ } from 'api/endpoints';
import { userApiClient } from 'api/userApiClient';
import { queryStaleTime } from 'query/queryConfigs';
import { FaqListResponse } from '@new-ui/types/faq';

export const faqKeys = {
  all: ['faq'] as const,
  list: (search: string) => [...faqKeys.all, 'list', search] as const,
};

/** FAQ list, optionally filtered by a server-side `search` query. */
export function useFaqList(search: string) {
  return useQuery({
    queryKey: faqKeys.list(search),
    queryFn: async () =>
      await userApiClient.get<FaqListResponse>(
        `${FAQ.LIST}?search=${encodeURIComponent(search)}`
      ),
    staleTime: queryStaleTime.VERY_SLOW_STALE_TIME,
    placeholderData: keepPreviousData,
  });
}
