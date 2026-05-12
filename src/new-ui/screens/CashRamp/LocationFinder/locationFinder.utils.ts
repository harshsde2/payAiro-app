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
