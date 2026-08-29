import { formatServerDate } from "utils/dateUtils";

export const getInitials = (name: string): string => {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  let initials = parts[0].charAt(0).toUpperCase();
  if (parts.length > 1) {
    initials += parts[parts.length - 1].charAt(0).toUpperCase();
  }
  return initials;
};

export function formatProfilePhone(
  sources: Record<string, unknown> | null | undefined,
  wallet: Record<string, unknown> | null | undefined
): string | null {
  const national = String(
    sources?.phone_national_number ??
      sources?.phone ??
      sources?.mobile ??
      wallet?.mobile_number ??
      wallet?.phone_national_number ??
      ""
  ).replace(/\D/g, "");
  if (!national) return null;

  const countryCode =
    String(sources?.phone_country_code ?? "1").replace(/\D/g, "") || "1";

  if (national.length === 10) {
    return `+${countryCode} (${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
  }
  if (national.length === 11 && national.startsWith("1")) {
    return `+1 (${national.slice(1, 4)}) ${national.slice(4, 7)}-${national.slice(7)}`;
  }
  return `+${countryCode} ${national}`;
}

/** "2026-07-29T20:03:05Z" → "Jul 2026". */
export const formatMemberSince = (dateJoined: string | null | undefined): string | null => {
  if (!dateJoined) return null;
  const formatted = formatServerDate(dateJoined, "MMM YYYY");
  return formatted || null;
};

const COUNTRY_ALPHA3_NAMES: Record<string, string> = {
  USA: "United States",
  CAN: "Canada",
  MEX: "Mexico",
  GBR: "United Kingdom",
};

/** "USA" → "United States"; unknown/short codes are returned as-is. */
export const formatCountryName = (alpha3: string | null | undefined): string | null => {
  if (!alpha3) return null;
  const code = alpha3.trim().toUpperCase();
  return COUNTRY_ALPHA3_NAMES[code] ?? alpha3;
};
