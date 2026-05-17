/** Normalize US state from profile or location rows for geofence comparison. */

const US_STATE_NAME_TO_ABBR: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
  "district of columbia": "DC",
};

export function normalizeUsStateCode(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const t = String(raw).trim();
  if (!t) return null;
  const upper = t.toUpperCase();
  if (upper.length === 2) return upper;
  const mapped = US_STATE_NAME_TO_ABBR[t.toLowerCase()];
  return mapped ?? null;
}

function pickString(obj: Record<string, unknown> | null | undefined, keys: string[]): string | null {
  if (!obj) return null;
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

export function getProfileResidentialStateCode(userData: unknown, usersMe: unknown): string | null {
  const ud = userData && typeof userData === "object" ? (userData as Record<string, unknown>) : null;
  const me = usersMe && typeof usersMe === "object" ? (usersMe as Record<string, unknown>) : null;

  const fromUser = pickString(ud, ["state", "address_state", "region"]);
  if (fromUser) return normalizeUsStateCode(fromUser);

  const addr = ud?.address;
  if (addr && typeof addr === "object") {
    const s = pickString(addr as Record<string, unknown>, ["state", "region"]);
    if (s) return normalizeUsStateCode(s);
  }

  const li = me?.legal_identity;
  if (li && typeof li === "object") {
    const s = pickString(li as Record<string, unknown>, ["state", "address_state", "region"]);
    if (s) return normalizeUsStateCode(s);
  }

  const kyc = me?.kyc;
  if (kyc && typeof kyc === "object") {
    const s = pickString(kyc as Record<string, unknown>, ["state", "address_state"]);
    if (s) return normalizeUsStateCode(s);
  }

  return null;
}

/**
 * When profile state is unknown, allow any location (skip geofence).
 * When known, store state must match after normalization.
 */
export function isCashRampStoreStateAllowed(
  storeStateRaw: string | null | undefined,
  profileStateCode: string | null
): { allowed: boolean; skipCheck: boolean } {
  if (!profileStateCode) {
    return { allowed: true, skipCheck: true };
  }
  const storeNorm = normalizeUsStateCode(storeStateRaw);
  if (!storeNorm) {
    return { allowed: true, skipCheck: false };
  }
  return { allowed: storeNorm === profileStateCode, skipCheck: false };
}
