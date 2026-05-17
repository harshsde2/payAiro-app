import { useEffect, useState } from "react";

export function formatMmSs(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/** Barcode expiry display: MM:SS under 1h, otherwise H:MM:SS (reference: 49:59). */
export function formatBarcodeExpiryCountdown(totalSeconds: number): string {
  const capped = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(capped / 3600);
  const minutes = Math.floor((capped % 3600) / 60);
  const seconds = capped % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const ONE_HOUR_SEC = 60 * 60;
const TWO_HOURS_SEC = 2 * ONE_HOUR_SEC;

/**
 * Parses Coinme `expiryTimestamp` (ISO, unix sec/ms, or TTL seconds).
 * Caps at 1 hour from now per retail barcode rules.
 */
export function resolveBarcodeExpiryAt(
  raw: string | undefined | null,
  sessionFallback: Date
): Date {
  const now = Date.now();
  const oneHourFromNow = now + ONE_HOUR_SEC * 1000;

  const parsed = parseCoinmeExpiryTimestamp(raw);
  if (!parsed) {
    return new Date(Math.min(sessionFallback.getTime(), oneHourFromNow));
  }

  let expiryMs = parsed.getTime();
  let remainingSec = (expiryMs - now) / 1000;

  // Unix seconds often mis-read as ms → huge minute counts (e.g. 10079:57).
  if (remainingSec > TWO_HOURS_SEC && raw != null) {
    const trimmed = String(raw).trim();
    if (/^\d+$/.test(trimmed)) {
      const n = Number(trimmed);
      if (n >= 1e9 && n < 1e11) {
        expiryMs = n * 1000;
        remainingSec = (expiryMs - now) / 1000;
      }
    }
  }

  if (!Number.isFinite(remainingSec) || remainingSec <= 0) {
    return new Date(Math.min(sessionFallback.getTime(), oneHourFromNow));
  }

  const cappedMs = Math.min(expiryMs, oneHourFromNow);
  return new Date(cappedMs);
}

export function parseCoinmeExpiryTimestamp(
  raw: string | number | undefined | null
): Date | null {
  if (raw == null || raw === "") return null;

  if (typeof raw === "number" && Number.isFinite(raw)) {
    return epochNumberToDate(raw);
  }

  const trimmed = String(raw).trim();
  if (!trimmed) return null;

  if (/^\d+$/.test(trimmed)) {
    return epochNumberToDate(Number(trimmed));
  }

  const iso = new Date(trimmed);
  return Number.isNaN(iso.getTime()) ? null : iso;
}

function epochNumberToDate(n: number): Date | null {
  if (!Number.isFinite(n) || n <= 0) return null;
  // Unix seconds (10-digit epoch)
  if (n >= 1e9 && n < 1e11) {
    return new Date(n * 1000);
  }
  // Unix milliseconds
  if (n >= 1e12) {
    return new Date(n);
  }
  // TTL in seconds from issuance (e.g. 3600)
  if (n > 0 && n <= 86400) {
    return new Date(Date.now() + n * 1000);
  }
  return new Date(n);
}

export function formatDurationShort(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m <= 0) return `${r}s`;
  if (r === 0) return `${m}m`;
  return `${m}m ${r}s`;
}

export function useCountdownTo(target: Date | null): number | null {
  const [remaining, setRemaining] = useState<number | null>(() => {
    if (!target) return null;
    return Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!target) {
      setRemaining(null);
      return;
    }
    const tick = () => {
      setRemaining(Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target?.getTime()]);

  return remaining;
}

export function useIntervalCountdown(
  durationSeconds: number,
  restartKey: number = 0
): number {
  const [remaining, setRemaining] = useState(durationSeconds);

  useEffect(() => {
    setRemaining(durationSeconds);
    const id = setInterval(() => {
      setRemaining((prev) => (prev <= 1 ? durationSeconds : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [durationSeconds, restartKey]);

  return remaining;
}
