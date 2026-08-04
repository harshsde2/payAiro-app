import type { ActivityRequestItem, ActivityRequestParty } from "./types";

export type RequestDisplayStatus = {
  label: string;
  colorKey: "warning" | "error" | "success";
};

/** Map the request's backend status to a display label + color bucket. */
export function resolveRequestDisplayStatus(
  item: ActivityRequestItem
): RequestDisplayStatus {
  const status = String(item.status ?? "").toUpperCase();
  switch (status) {
    case "FULFILLED":
    case "COMPLETED":
    case "PAID":
      return { label: "Fulfilled", colorKey: "success" };
    case "CANCELLED":
      return { label: "Cancelled", colorKey: "error" };
    case "DECLINED":
    case "REJECTED":
      return { label: "Declined", colorKey: "error" };
    case "EXPIRED":
      return { label: "Expired", colorKey: "error" };
    case "PENDING":
    case "":
      return { label: "Pending", colorKey: "warning" };
    default:
      return {
        label: status.charAt(0) + status.slice(1).toLowerCase(),
        colorKey: "warning",
      };
  }
}

function partyName(party: ActivityRequestParty | null | undefined): string {
  if (!party) return "Unknown";
  const full = [party.firstName, party.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (party.username) return `@${party.username}`;
  return "Unknown";
}

/**
 * The other side to show on the card. "received" = someone requested money OF me,
 * so show the requester (`requestedBy`); "sent" = I requested, so show `requestedFrom`.
 */
export function getRequestCounterparty(
  item: ActivityRequestItem
): ActivityRequestParty | null {
  return item.direction === "received"
    ? item.requestedBy ?? null
    : item.requestedFrom ?? null;
}

export function getRequestCardTitle(item: ActivityRequestItem): string {
  const name = partyName(getRequestCounterparty(item));
  return item.direction === "received" ? `Request from ${name}` : `Request to ${name}`;
}

export function getRequestInitial(item: ActivityRequestItem): string {
  const name = partyName(getRequestCounterparty(item)).replace(/^@/, "").trim();
  return name ? name.charAt(0).toUpperCase() : "?";
}

/** Crypto amount string, e.g. "0.05385726 ETH". */
export function formatRequestCryptoAmount(item: ActivityRequestItem): string {
  const amt = Number.parseFloat(item.amount ?? "0");
  const code = String(item.currency ?? item.chain ?? "").trim().toUpperCase();
  const formatted = Number.isFinite(amt)
    ? amt.toFixed(8).replace(/\.?0+$/, "")
    : item.amount ?? "0";
  return code ? `${formatted} ${code}` : formatted;
}
