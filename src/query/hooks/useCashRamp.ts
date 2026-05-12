import { useQuery } from "@tanstack/react-query";
import { USER_AUTH } from "api/endpoints";
import { userApiClient } from "api/userApiClient";

export interface CashRampNearbyLocation {
  id: string;
  locationReference: string;
  provider: string;
  country: string;
  state: string;
  city: string;
  address: string;
  zipCode?: string | null;
  /** API may return a string or per-day map (e.g. SUNDAY: "08:00 - 21:00 PST"). */
  hours?: string | Record<string, string> | null;
  sellAllowed?: boolean;
  buyAllowed?: boolean;
  imageUrl?: string | null;
  googlePlacesLink?: string | null;
  notes?: string | null;
  description?: string | null;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  lineOfSightDistance?: number | null;
  lineOfSightMetric?: string | null;
  supportedCoins?: string[];
  locationFees?: unknown;
  metadata?: Record<string, unknown>;
}

export interface CashRampNearbyResponse {
  ok?: boolean;
  message?: string;
  data?: {
    providers?: string[];
    locations?: CashRampNearbyLocation[];
  };
}

type NearbyQueryArgs = {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
  /** e.g. ALLPOINT — appended as query param when set */
  providers?: string;
  enabled?: boolean;
};

export const cashRampKeys = {
  all: ["cashRamp"] as const,
  nearby: (
    latitude: number,
    longitude: number,
    radius: number,
    limit: number,
    providers?: string | null
  ) =>
    [...cashRampKeys.all, "nearby", latitude, longitude, radius, limit, providers ?? ""] as const,
};

export const useNearbyCashLocations = ({
  latitude,
  longitude,
  radius = 10,
  limit = 10,
  providers,
  enabled = true,
}: NearbyQueryArgs) => {
  const providersKey = providers?.trim() ? providers.trim() : null;
  let url = `${USER_AUTH.LOCATIONS_NEARBY}?latitude=${latitude}&longitude=${longitude}&radius=${radius}&limit=${limit}`;
  if (providersKey) {
    url += `&providers=${encodeURIComponent(providersKey)}`;
  }

  return useQuery<CashRampNearbyResponse>({
    queryKey: cashRampKeys.nearby(latitude, longitude, radius, limit, providersKey),
    queryFn: () => userApiClient.get<CashRampNearbyResponse>(url),
    enabled: enabled && Number.isFinite(latitude) && Number.isFinite(longitude),
  });
};
