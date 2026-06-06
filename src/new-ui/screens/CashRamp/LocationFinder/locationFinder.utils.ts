import { CashRampNearbyLocation } from "query/hooks/useCashRamp";

export const formatLocationHours = (hours: CashRampNearbyLocation["hours"]): string => {
  if (hours == null) return "";
  if (typeof hours === "string") return hours.trim();
  if (typeof hours === "object") {
    const entries = Object.entries(hours).filter(([, v]) => typeof v === "string" && String(v).trim());
    if (entries.length === 0) return "";
    return entries.map(([k, v]) => `${k}: ${v}`).join("\n");
  }
  return "";
};

const DEFAULT_CENTER = {
  latitude: 37.422,
  longitude: -122.0841,
};

export const getInitialCoordinates = () => DEFAULT_CENTER;

export const formatProviderLabel = (provider?: string | null) => {
  if (!provider) return "Store partner";
  if (provider.toUpperCase() === "GREENDOT") return "Powered by Green Dot";
  return provider;
};

export const formatDistance = (distance?: number | null, metric?: string | null) => {
  if (!Number.isFinite(Number(distance))) return "";
  const safeMetric = String(metric || "mi").toLowerCase();
  return `${Number(distance).toFixed(1)} ${safeMetric}`;
};

export const buildAddressLine = (location: Pick<CashRampNearbyLocation, "address" | "city" | "state" | "zipCode">) => {
  const parts = [location.address, location.city, location.state, location.zipCode]
    .map((v) => String(v || "").trim())
    .filter(Boolean);
  return parts.join(", ");
};

export const mapMarkerLabel = (index: number) => `${index + 1}`;

function pickLegalIdentityString(
  obj: Record<string, unknown> | null | undefined,
  keys: string[]
): string | null {
  if (!obj) return null;
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function formatCountryForGeocoder(countryRaw: string | null): string | null {
  if (!countryRaw) return null;
  const upper = countryRaw.toUpperCase();
  if (upper === "USA" || upper === "US") return "US";
  return countryRaw;
}

function unwrapUsersMePayload(usersMe: unknown): Record<string, unknown> | null {
  const root = usersMe && typeof usersMe === "object" ? (usersMe as Record<string, unknown>) : null;
  if (!root) return null;
  if (root.legal_identity != null) return root;
  const data = root.data;
  if (data && typeof data === "object") return data as Record<string, unknown>;
  return root;
}

export type LegalIdentityGeocodeInput = {
  addressLine: string;
  city: string | null;
  /** US state code (e.g. MI) — biases Geocoding API and validates results. */
  stateCode: string | null;
  postalCode: string | null;
};

export type ProfileGeocodeAttempt = {
  address: string;
  stateCode: string | null;
  /** When false, only country+state components are sent (avoids zip/state conflicts in test data). */
  includePostalInComponents: boolean;
};

/** Approximate geographic center per US state — used when street geocode fails but state is known. */
const US_STATE_CENTER: Record<string, { latitude: number; longitude: number }> = {
  MI: { latitude: 43.3261, longitude: -84.5361 },
  CA: { latitude: 36.7783, longitude: -119.4179 },
  NY: { latitude: 43.0, longitude: -75.0 },
  TX: { latitude: 31.0, longitude: -99.0 },
  FL: { latitude: 27.7663, longitude: -81.6868 },
};

export function getUsStateCenterCoordinates(
  stateCode: string | null | undefined
): { latitude: number; longitude: number } | null {
  if (!stateCode) return null;
  const code = stateCode.trim().toUpperCase();
  return US_STATE_CENTER[code] ?? null;
};

/** Ordered geocode queries: full address, then city/state, then state-only. */
export function buildProfileGeocodeAttempts(
  input: LegalIdentityGeocodeInput
): ProfileGeocodeAttempt[] {
  const attempts: ProfileGeocodeAttempt[] = [];
  const stateCode = input.stateCode;
  const push = (address: string) => {
    const trimmed = address.trim();
    if (!trimmed) return;
    if (attempts.some((a) => a.address === trimmed)) return;
    attempts.push({
      address: trimmed,
      stateCode,
      includePostalInComponents: false,
    });
  };

  push(input.addressLine);

  const cityStateUs = [input.city, stateCode, "US"].filter(Boolean).join(", ");
  push(cityStateUs);

  if (stateCode) {
    push(`${stateCode}, USA`);
  }

  return attempts;
}

/** Address parts from Redux `usersMe` (`/users/me/` → `data.legal_identity`). */
export function parseLegalIdentityForGeocode(usersMe: unknown): LegalIdentityGeocodeInput | null {
  const me = unwrapUsersMePayload(usersMe);
  const li = me?.legal_identity;
  if (!li || typeof li !== "object") return null;

  const record = li as Record<string, unknown>;
  const line1 = pickLegalIdentityString(record, ["address_line1", "address_line_1", "street"]);
  const line2 = pickLegalIdentityString(record, ["address_line2", "address_line_2"]);
  const city = pickLegalIdentityString(record, ["city"]);
  const stateRaw = pickLegalIdentityString(record, ["state", "address_state", "region"]);
  const stateCode =
    stateRaw && stateRaw.length === 2 ? stateRaw.toUpperCase() : stateRaw?.toUpperCase() ?? null;
  const postal = pickLegalIdentityString(record, ["postal_code", "zip_code", "zipCode", "zip"]);
  const country = formatCountryForGeocoder(
    pickLegalIdentityString(record, ["country_alpha3", "country", "country_code"])
  );

  if (!line1 && !city) return null;

  const parts = [line1, line2, city, stateCode, postal, country].filter(Boolean) as string[];
  if (parts.length === 0) return null;

  return {
    addressLine: parts.join(", "),
    city,
    stateCode,
    postalCode: postal,
  };
}

/** Single-line address from `/users/me` `legal_identity` for geocoding. */
export function buildLegalIdentityAddressLine(usersMe: unknown): string | null {
  return parseLegalIdentityForGeocode(usersMe)?.addressLine ?? null;
}
