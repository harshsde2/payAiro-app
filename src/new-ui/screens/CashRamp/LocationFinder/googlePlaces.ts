import { Platform } from "react-native";
import Config from "react-native-config";
import DeviceInfo from "react-native-device-info";
import type { LegalIdentityGeocodeInput } from "./locationFinder.utils";
import {
  buildProfileGeocodeAttempts,
  getUsStateCenterCoordinates,
} from "./locationFinder.utils";

export type PlacePrediction = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

export type PlaceAutocompleteResult = {
  predictions: PlacePrediction[];
  status: string;
  errorMessage?: string;
};

export type LocationBias = {
  latitude: number;
  longitude: number;
};

/** ISO 3166-1 alpha-2; autocomplete is limited to these regions (product: US-only). */
const PLACES_AUTOCOMPLETE_INCLUDED_REGION_CODES = ["US"] as const;

/** Places API (New) `locationBias.circle.radius` must be in (0, 50_000] meters. */
export const PLACES_NEW_LOCATION_BIAS_RADIUS_MAX_M = 50_000;

/** SHA-1 for X-Android-Cert: lowercase hex, no colons (Google Places REST requirement). */
function normalizeAndroidCertSha1(raw: string): string | undefined {
  const s = raw.trim().replace(/:/g, "").toLowerCase();
  return /^[0-9a-f]{40}$/.test(s) ? s : undefined;
}

/**
 * iOS API keys restricted by bundle ID require this header on REST calls.
 * Without it, Google responds with "Requests from this iOS client application <empty> are blocked."
 */
function googlePlacesIosHeaders(): Record<string, string> {
  if (Platform.OS !== "ios") return {};
  try {
    const bundleId = DeviceInfo.getBundleId();
    if (!bundleId) return {};
    return { "X-Ios-Bundle-Identifier": bundleId };
  } catch {
    return {};
  }
}

/**
 * Android-restricted API keys require package + signing cert on Places REST calls.
 * Without them: "Requests from this Android client application <empty> are blocked."
 * Set GOOGLE_MAPS_ANDROID_CERT_SHA1 in .env (debug SHA-1 from ./gradlew signingReport, no colons).
 */
function googlePlacesAndroidHeaders(): Record<string, string> {
  if (Platform.OS !== "android") return {};
  try {
    const pkg = DeviceInfo.getBundleId();
    const cert = normalizeAndroidCertSha1(Config.GOOGLE_MAPS_ANDROID_CERT_SHA1 || "");
    if (!pkg || !cert) return {};
    return {
      "X-Android-Package": pkg,
      "X-Android-Cert": cert,
    };
  } catch {
    return {};
  }
}

function googlePlacesClientHeaders(): Record<string, string> {
  return {
    ...googlePlacesIosHeaders(),
    ...googlePlacesAndroidHeaders(),
  };
}

/** Read body once; avoid `res.json()` throwing when Google/proxy returns HTML. */
async function readResponseJson(res: Response): Promise<{
  json: unknown | null;
  textPreview: string;
  parseFailed: boolean;
}> {
  const text = await res.text();
  const trimmed = text.trim();
  const textPreview =
    trimmed.length === 0
      ? "(empty body)"
      : trimmed.length <= 400
        ? trimmed.replace(/\s+/g, " ")
        : `${trimmed.slice(0, 400).replace(/\s+/g, " ")}…`;
  if (!trimmed) {
    return { json: null, textPreview, parseFailed: false };
  }
  try {
    return { json: JSON.parse(text) as unknown, textPreview, parseFailed: false };
  } catch {
    return { json: null, textPreview, parseFailed: true };
  }
}

const parseLegacyPredictions = (json: { predictions?: unknown[] }): PlacePrediction[] => {
  const preds = json.predictions;
  if (!Array.isArray(preds)) return [];
  return preds
    .map((p: Record<string, unknown>) => {
      const placeId = typeof p.place_id === "string" ? p.place_id : "";
      const description = typeof p.description === "string" ? p.description : "";
      const sf = p.structured_formatting as Record<string, unknown> | undefined;
      const mainText = typeof sf?.main_text === "string" ? sf.main_text : description;
      const secondaryText = typeof sf?.secondary_text === "string" ? sf.secondary_text : "";
      if (!placeId) return null;
      return { placeId, description, mainText, secondaryText };
    })
    .filter((x): x is PlacePrediction => x != null);
};

type NewPlacePredictionRaw = {
  place?: string;
  placeId?: string;
  text?: { text?: string };
  structuredFormat?: {
    mainText?: { text?: string };
    secondaryText?: { text?: string };
  };
};

type NewAutocompleteBody = {
  suggestions?: Array<{
    placePrediction?: NewPlacePredictionRaw;
  }>;
};

const parseNewPredictions = (data: NewAutocompleteBody): PlacePrediction[] => {
  const suggestions = data.suggestions;
  if (!Array.isArray(suggestions)) return [];
  const out: PlacePrediction[] = [];
  for (const s of suggestions) {
    const pp = s.placePrediction;
    if (!pp) continue;
    let placeId = typeof pp.placeId === "string" ? pp.placeId.trim() : "";
    if (!placeId && typeof pp.place === "string") {
      placeId = pp.place.replace(/^places\//, "").trim();
    }

    const fromText = typeof pp.text?.text === "string" ? pp.text.text.trim() : "";
    const sf = pp.structuredFormat;
    const mainFromSf = typeof sf?.mainText?.text === "string" ? sf.mainText.text.trim() : "";
    const secondaryFromSf =
      typeof sf?.secondaryText?.text === "string" ? sf.secondaryText.text.trim() : "";

    let description = fromText;
    let mainText = "";
    let secondaryText = "";
    if (mainFromSf) {
      mainText = mainFromSf;
      secondaryText = secondaryFromSf;
      if (!description) {
        description = secondaryText ? `${mainText}, ${secondaryText}` : mainText;
      }
    } else if (description) {
      const comma = description.indexOf(",");
      mainText = comma >= 0 ? description.slice(0, comma).trim() : description;
      secondaryText = comma >= 0 ? description.slice(comma + 1).trim() : "";
    }

    if (!placeId || !description) continue;
    out.push({
      placeId,
      description,
      mainText: mainText || description,
      secondaryText,
    });
  }
  return out;
};

export function newPlacesSessionToken(): string {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function fetchNewPlacePredictions(params: {
  input: string;
  apiKey: string;
  sessionToken: string;
  signal?: AbortSignal;
  /** Optional soft bias; radius is clamped to Google's 50 km max. Omit center if invalid. */
  locationBias?: LocationBias;
}): Promise<PlaceAutocompleteResult> {
  const { input, apiKey, sessionToken, signal, locationBias } = params;
  const q = input.trim();
  if (q.length < 1) {
    return { predictions: [], status: "SKIP" };
  }

  const body: Record<string, unknown> = {
    input: q,
    sessionToken,
    languageCode: "en",
    regionCode: "US",
    includedRegionCodes: [...PLACES_AUTOCOMPLETE_INCLUDED_REGION_CODES],
  };

  if (
    locationBias &&
    Number.isFinite(locationBias.latitude) &&
    Number.isFinite(locationBias.longitude)
  ) {
    body.locationBias = {
      circle: {
        center: { latitude: locationBias.latitude, longitude: locationBias.longitude },
        radius: PLACES_NEW_LOCATION_BIAS_RADIUS_MAX_M,
      },
    };
  }

  let res: Response;
  try {
    res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
        ...googlePlacesClientHeaders(),
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    return { predictions: [], status: "FETCH_ERROR", errorMessage: "Network error loading suggestions." };
  }

  const { json, textPreview, parseFailed } = await readResponseJson(res);
  if (parseFailed) {
    return {
      predictions: [],
      status: `HTTP_${res.status}_NON_JSON`,
      errorMessage: `Places (New) returned non-JSON (often HTML error page). HTTP ${res.status} ${res.statusText}. Preview: ${textPreview}`,
    };
  }

  const raw = (json ?? {}) as NewAutocompleteBody & {
    error?: { code?: number; message?: string; status?: string };
  };

  if (!res.ok) {
    return {
      predictions: [],
      status: raw.error?.status || `HTTP_${res.status}`,
      errorMessage: raw.error?.message || res.statusText || textPreview,
    };
  }

  const predictions = parseNewPredictions(raw);
  return {
    predictions,
    status: predictions.length ? "OK" : "ZERO_RESULTS",
  };
}

async function fetchLegacyPlacePredictions(params: {
  input: string;
  apiKey: string;
  sessionToken: string;
  signal?: AbortSignal;
}): Promise<PlaceAutocompleteResult> {
  const { input, apiKey, sessionToken, signal } = params;
  const q = input.trim();
  if (q.length < 1) {
    return { predictions: [], status: "SKIP" };
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
  url.searchParams.set("input", q);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("sessiontoken", sessionToken);
  url.searchParams.set("language", "en");
  url.searchParams.set("components", "country:us");

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      signal,
      headers: {
        ...googlePlacesClientHeaders(),
      },
    });
  } catch {
    return { predictions: [], status: "FETCH_ERROR", errorMessage: "Network error (legacy autocomplete)." };
  }

  const { json: parsed, textPreview, parseFailed } = await readResponseJson(res);
  if (parseFailed) {
    return {
      predictions: [],
      status: `HTTP_${res.status}_NON_JSON`,
      errorMessage: `Legacy Places returned non-JSON. HTTP ${res.status} ${res.statusText}. Preview: ${textPreview}`,
    };
  }

  const json = (parsed ?? {}) as {
    predictions?: unknown[];
    status?: string;
    error_message?: string;
  };

  const status = json.status || "UNKNOWN";
  if (status === "OK" || status === "ZERO_RESULTS") {
    return { predictions: parseLegacyPredictions(json), status };
  }
  return {
    predictions: [],
    status,
    errorMessage: json.error_message,
  };
}

/**
 * Tries Places API (New) first, then legacy Autocomplete when New returns no rows.
 * New often returns ZERO_RESULTS with an empty list under strict locationBias or
 * partial field masks — legacy still fills suggestions in those cases.
 */
export async function fetchPlacePredictions(params: {
  input: string;
  apiKey: string;
  sessionToken: string;
  signal?: AbortSignal;
  locationBias?: LocationBias;
}): Promise<PlaceAutocompleteResult> {
  const neu = await fetchNewPlacePredictions(params);
  if (neu.predictions.length > 0) {
    return neu;
  }

  const legacy = await fetchLegacyPlacePredictions(params);
  if (legacy.predictions.length > 0) {
    return legacy;
  }

  const message = neu.errorMessage || legacy.errorMessage;
  let status = legacy.status !== "UNKNOWN" ? legacy.status : neu.status;
  if (message) {
    const benign = (s: string) =>
      s === "ZERO_RESULTS" || s === "OK" || s === "SKIP";
    if (!benign(neu.status)) status = neu.status;
    else if (!benign(legacy.status)) status = legacy.status;
  }

  return {
    predictions: [],
    status,
    errorMessage: message,
  };
}

async function fetchNewPlaceDetailsLatLng(params: {
  placeId: string;
  apiKey: string;
  sessionToken: string;
  signal?: AbortSignal;
}): Promise<{ lat: number; lng: number } | null> {
  const { placeId, apiKey, sessionToken, signal } = params;
  const id = encodeURIComponent(placeId);
  const url = new URL(`https://places.googleapis.com/v1/places/${id}`);
  url.searchParams.set("sessionToken", sessionToken);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "location",
      ...googlePlacesClientHeaders(),
    },
    signal,
  });

  if (!res.ok) return null;
  const { json, parseFailed } = await readResponseJson(res);
  if (parseFailed || !json || typeof json !== "object") return null;
  const obj = json as { location?: { latitude?: number; longitude?: number } };
  const lat = obj.location?.latitude;
  const lng = obj.location?.longitude;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat: lat as number, lng: lng as number };
}

async function fetchLegacyPlaceDetailsLatLng(params: {
  placeId: string;
  apiKey: string;
  sessionToken: string;
  signal?: AbortSignal;
}): Promise<{ lat: number; lng: number } | null> {
  const { placeId, apiKey, sessionToken, signal } = params;
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "geometry/location");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("sessiontoken", sessionToken);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      signal,
      headers: {
        ...googlePlacesClientHeaders(),
      },
    });
  } catch {
    return null;
  }

  const { json: parsed, parseFailed } = await readResponseJson(res);
  if (parseFailed || !parsed || typeof parsed !== "object") return null;
  const json = parsed as {
    status?: string;
    result?: { geometry?: { location?: { lat?: number; lng?: number } } };
  };

  if (json.status !== "OK") return null;
  const lat = json.result?.geometry?.location?.lat;
  const lng = json.result?.geometry?.location?.lng;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat: lat as number, lng: lng as number };
}

export async function fetchPlaceDetailsLatLng(params: {
  placeId: string;
  apiKey: string;
  sessionToken: string;
  signal?: AbortSignal;
}): Promise<{ lat: number; lng: number } | null> {
  const neu = await fetchNewPlaceDetailsLatLng(params);
  if (neu) return neu;
  return fetchLegacyPlaceDetailsLatLng(params);
}

type GeocodeResultRow = {
  geometry?: { location?: { lat?: number; lng?: number } };
  address_components?: Array<{
    short_name?: string;
    long_name?: string;
    types?: string[];
  }>;
};

function geocodeResultMatchesUsState(
  result: GeocodeResultRow,
  expectedState: string | null
): boolean {
  if (!expectedState) return true;
  const norm = expectedState.trim().toUpperCase();
  const components = result.address_components;
  if (!Array.isArray(components)) return true;
  return components.some((c) => {
    const types = c.types ?? [];
    if (!types.includes("administrative_area_level_1")) return false;
    const short = (c.short_name ?? "").toUpperCase();
    const long = (c.long_name ?? "").toUpperCase();
    return short === norm || long === norm;
  });
}

function buildGeocodeComponentsFilter(params: {
  stateCode?: string | null;
  postalCode?: string | null;
  includePostalInComponents?: boolean;
}): string | null {
  const parts = ["country:US"];
  const state = params.stateCode?.trim().toUpperCase();
  if (state && state.length === 2) {
    parts.push(`administrative_area:${state}`);
  }
  if (params.includePostalInComponents) {
    const postal = params.postalCode?.trim();
    if (postal) {
      parts.push(`postal_code:${postal}`);
    }
  }
  return parts.join("|");
}

/** Geocoding API — residential address from profile to map center. */
export async function geocodeAddressToLatLng(params: {
  address: string;
  apiKey: string;
  signal?: AbortSignal;
  stateCode?: string | null;
  postalCode?: string | null;
  includePostalInComponents?: boolean;
}): Promise<{ lat: number; lng: number } | null> {
  const { address, apiKey, signal, stateCode, postalCode, includePostalInComponents } =
    params;
  const q = address.trim();
  if (!q || !apiKey.trim()) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", q);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("region", "us");
  const components = buildGeocodeComponentsFilter({
    stateCode,
    postalCode,
    includePostalInComponents,
  });
  if (components) {
    url.searchParams.set("components", components);
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      signal,
      headers: {
        ...googlePlacesClientHeaders(),
      },
    });
  } catch {
    return null;
  }

  const { json, parseFailed } = await readResponseJson(res);
  if (parseFailed || !json || typeof json !== "object") return null;

  const body = json as {
    status?: string;
    results?: GeocodeResultRow[];
  };

  if (body.status !== "OK" || !Array.isArray(body.results) || body.results.length === 0) {
    if (__DEV__ && body.status && body.status !== "ZERO_RESULTS") {
      console.warn("[geocodeAddressToLatLng]", body.status, q);
    }
    return null;
  }

  const expectedState = stateCode?.trim().toUpperCase() ?? null;
  const match =
    body.results.find((row) => geocodeResultMatchesUsState(row, expectedState)) ??
    body.results[0];

  const lat = match?.geometry?.location?.lat;
  const lng = match?.geometry?.location?.lng;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat: lat as number, lng: lng as number };
}

/** Tries multiple address strings; falls back to approximate US state center. */
export async function geocodeProfileLegalIdentity(params: {
  profile: LegalIdentityGeocodeInput;
  apiKey: string;
  signal?: AbortSignal;
}): Promise<{ lat: number; lng: number } | null> {
  const { profile, apiKey, signal } = params;
  const attempts = buildProfileGeocodeAttempts(profile);

  for (const attempt of attempts) {
    const geo = await geocodeAddressToLatLng({
      address: attempt.address,
      apiKey,
      stateCode: attempt.stateCode,
      postalCode: profile.postalCode,
      includePostalInComponents: attempt.includePostalInComponents,
      signal,
    });
    if (geo) return geo;
  }

  const stateCenter = getUsStateCenterCoordinates(profile.stateCode);
  if (stateCenter) {
    return { lat: stateCenter.latitude, lng: stateCenter.longitude };
  }

  return null;
}
