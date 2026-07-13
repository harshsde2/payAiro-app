import moment from "moment";

/**
 * Central date/time helper for server timestamps.
 *
 * The backend sends timestamps in UTC. Users are spread across timezones, so we
 * always convert to the DEVICE-LOCAL timezone for display. The tricky part is
 * that a naive ISO string (no trailing `Z`/offset) is parsed by moment as LOCAL
 * time — which would shift a UTC value incorrectly. `parseServerDate` treats
 * naive strings as UTC and respects explicit offsets, then converts to local.
 *
 * Route every server timestamp render through this module so display stays
 * correct and consistent regardless of whether the string carries an offset.
 */

const OFFSET_RE = /(?:Z|[+-]\d{2}:?\d{2})$/i;

// Explicit formats so unrecognized strings return an INVALID moment instead of
// triggering moment's slow, noisy Date() deprecation fallback (which some jest
// setups treat as a failure and which spams console warnings in the app).
const SERVER_FORMATS: moment.MomentFormatSpecification = [
  moment.ISO_8601,
  "YYYY-MM-DD HH:mm:ss",
  "YYYY-MM-DD HH:mm",
  "YYYY-MM-DD",
];

/** Accepted server-timestamp inputs. */
export type DateInput = string | number | Date | null | undefined;

/** Parse a server timestamp as UTC-when-naive, then convert to device-local. */
export function parseServerDate(input?: DateInput): moment.Moment {
  if (input === null || input === undefined || input === "") {
    return moment.invalid();
  }
  if (typeof input === "number" || input instanceof Date) {
    // Epoch ms / Date are already absolute instants.
    return moment(input);
  }
  const s = String(input).trim();
  // Offset present → respect it (already resolves to a fixed instant; moment
  // renders it in device-local). Naive → interpret as UTC, then convert to local.
  // Strict parsing (last arg `true`) → invalid input yields an invalid moment.
  return OFFSET_RE.test(s)
    ? moment(s, moment.ISO_8601, true)
    : moment.utc(s, SERVER_FORMATS, true).local();
}

/** Generic safe formatter: returns `fallback` when the input is unparseable. */
export function formatServerDate(
  input: DateInput,
  fmt: string,
  fallback = ""
): string {
  const m = parseServerDate(input);
  return m.isValid() ? m.format(fmt) : fallback;
}

// ── Named formatters (preserve each screen's existing visual format) ──────────

/** Activity / dashboard rows, e.g. "08 Jul. 26 | 02:30pm". */
export const formatActivityTimestamp = (
  input: DateInput,
  fallback = ""
): string => formatServerDate(input, "DD MMM[.] YY | hh:mma", fallback);

/** Transaction receipt (TransactionResult), e.g. "08 Jul 2026  2:30 PM". */
export const formatReceiptDateTime = (
  input: DateInput,
  fallback = ""
): string => formatServerDate(input, "DD MMM YYYY  h:mm A", fallback);

/** Transaction-detail date, e.g. "08 Jul 2026". */
export const formatDetailDate = (
  input: DateInput,
  fallback = ""
): string => formatServerDate(input, "DD MMM YYYY", fallback);

/** Transaction-detail time, e.g. "2:30 pm". */
export const formatDetailTime = (
  input: DateInput,
  fallback = ""
): string => formatServerDate(input, "h:mm a", fallback);

/** Long date-time, e.g. "July 8, 2026 at 2:30 PM" (cash ramp + compliance). */
export const formatLongDateTime = (
  input: DateInput,
  fallback = ""
): string => formatServerDate(input, "MMMM D, YYYY [at] h:mm A", fallback);

/** Dot-separated date-time, e.g. "Jul 8, 2026 · 2:30 PM" (requests, disclosures). */
export const formatDotDateTime = (
  input: DateInput,
  fallback = ""
): string => formatServerDate(input, "MMM D, YYYY [·] h:mm A", fallback);

/** Short date, e.g. "08 Jul. 26" (notifications). */
export const formatShortDate = (
  input: DateInput,
  fallback = ""
): string => formatServerDate(input, "DD MMM. YY", fallback);

// ── Day-grouping helpers (activity list section headers) ──────────────────────

/** Local-day key for grouping, e.g. "2026-07-08". Empty string if invalid. */
export const getDayGroupKey = (
  input: DateInput
): string => formatServerDate(input, "YYYY-MM-DD");

/** Human day-group label: "Today" / "Yesterday" / "08 Jul 26". */
export const getDayGroupLabel = (
  input: DateInput,
  fallback = ""
): string => {
  const m = parseServerDate(input);
  if (!m.isValid()) return fallback;
  if (m.isSame(moment(), "day")) return "Today";
  if (m.isSame(moment().subtract(1, "day"), "day")) return "Yesterday";
  return m.format("DD MMM YY");
};
