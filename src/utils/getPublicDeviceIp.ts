const IPIFY_URL = "https://api.ipify.org?format=json";
const DEFAULT_TIMEOUT_MS = 10_000;

type IpifyResponse = { ip?: string };

export async function getPublicDeviceIp(
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(IPIFY_URL, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`IP service returned ${res.status}`);
    }

    const json = (await res.json()) as IpifyResponse;
    const ip = typeof json?.ip === "string" ? json.ip.trim() : "";
    if (!ip) {
      throw new Error("Missing ip in response");
    }
    return ip;
  } finally {
    clearTimeout(timer);
  }
}
