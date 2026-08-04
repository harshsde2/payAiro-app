import type { KycVerifyDetails } from "auth/authSession";
import { normalizeUsStateCode } from "@new-ui/screens/CashRamp/LocationFinder/cashRampProfileState";

const str = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

/** First non-empty string found under `key` across the given objects. */
const pick = (
  sources: (Record<string, unknown> | null)[],
  ...keys: string[]
): string | undefined => {
  for (const source of sources) {
    if (!source) continue;
    for (const key of keys) {
      const found = str(source[key]);
      if (found) return found;
    }
  }
  return undefined;
};

/**
 * Fallback prefill for KYC step 2 when the user resumes after an app restart and we
 * have neither route params nor a persisted draft. `/users/me` spreads the identity
 * across `user` / `legal_identity` / `kyc` / `profile`, so check all of them.
 */
export const detailsFromUsersMe = (
  usersMe: unknown,
  userData: unknown
): KycVerifyDetails => {
  const me = asRecord(usersMe);
  const sources = [
    asRecord(userData),
    asRecord(me?.user),
    asRecord(me?.legal_identity),
    asRecord(me?.kyc),
    asRecord(me?.profile),
    asRecord(asRecord(userData)?.address),
  ];

  return {
    username: pick(sources, "username", "payairo_name"),
    email: pick(sources, "email"),
    phone: pick(sources, "phone", "phone_number", "phone_national_number"),
    first_name: pick(sources, "first_name", "firstName"),
    last_name: pick(sources, "last_name", "lastName"),
    date_of_birth: pick(sources, "date_of_birth", "dob"),
    ssn_last_four: pick(sources, "ssn_last_four", "ssn_last4"),
    address_line1: pick(sources, "address_line1", "address1", "street"),
    address_line2: pick(sources, "address_line2", "address2"),
    city: pick(sources, "city"),
    state: normalizeUsStateCode(pick(sources, "state", "address_state", "region")) ?? undefined,
    postal_code: pick(sources, "postal_code", "zip", "zip_code", "postcode"),
    country: pick(sources, "country"),
  };
};

/**
 * Merge the available prefill sources, most authoritative first: the step-1 response
 * passed as a route param, then the persisted draft, then `/users/me`.
 */
export const resolveKycVerifyDetails = (
  routeDetails: KycVerifyDetails | undefined,
  draft: KycVerifyDetails | null,
  fromUsersMe: KycVerifyDetails
): KycVerifyDetails => {
  const sources = [
    asRecord(routeDetails),
    asRecord(draft),
    asRecord(fromUsersMe),
  ];

  return {
    username: pick(sources, "username"),
    email: pick(sources, "email"),
    phone: pick(sources, "phone"),
    first_name: pick(sources, "first_name"),
    last_name: pick(sources, "last_name"),
    date_of_birth: pick(sources, "date_of_birth"),
    ssn_last_four: pick(sources, "ssn_last_four"),
    address_line1: pick(sources, "address_line1"),
    address_line2: pick(sources, "address_line2"),
    city: pick(sources, "city"),
    state: normalizeUsStateCode(pick(sources, "state")) ?? undefined,
    postal_code: pick(sources, "postal_code"),
    country: pick(sources, "country"),
  };
};
