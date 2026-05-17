/** PayArio redirect after Prove completes (must match backend / Coinme expectation). */
export const PAYAIRO_COINME_COMPLETE_PATH_MARKER = "prove-2fa/complete";

/** @deprecated Prefer PAYAIRO_COINME_COMPLETE_PATH_MARKER — old path slug; do not use for gate checks */
export const COMPLETE_PATH = "/coinme/prove/2fa/complete";

const MIN_VFP_LENGTH = 32;

export type CoinmeWebViewMessage = {
  type: "COINME_VFP";
  vfp: string;
};

/** True only when navigation is PayArio’s final complete URL — not Prove’s first redirect. */
export function isPayAiroCoinmeCompleteUrl(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.pathname.includes(PAYAIRO_COINME_COMPLETE_PATH_MARKER);
  } catch {
    return url.includes(PAYAIRO_COINME_COMPLETE_PATH_MARKER);
  }
}

/** @deprecated Use isPayAiroCoinmeCompleteUrl */
export function isCompletionUrl(url: string): boolean {
  return isPayAiroCoinmeCompleteUrl(url);
}

export function extractVfpFromUrl(url: string): string | null {
  const m = url.match(/[?&]vfp=([^&#'"]+)/);
  if (!m?.[1]) return null;
  try {
    const decoded = decodeURIComponent(m[1]);
    return decoded.length >= MIN_VFP_LENGTH ? decoded : null;
  } catch {
    return m[1].length >= MIN_VFP_LENGTH ? m[1] : null;
  }
}

/** Only returns vfp when URL is PayArio …/prove-2fa/complete?… — ignores Prove step-down URLs. */
export function tryFinishVfpFromUrl(url: string): string | null {
  if (!url || !isPayAiroCoinmeCompleteUrl(url)) return null;
  return extractVfpFromUrl(url);
}

export function parseCoinmeWebViewMessage(
  data: string
): CoinmeWebViewMessage | null {
  try {
    const parsed = JSON.parse(data) as { type?: string; vfp?: string };
    if (
      parsed?.type === "COINME_VFP" &&
      typeof parsed.vfp === "string" &&
      parsed.vfp.length >= MIN_VFP_LENGTH
    ) {
      return { type: "COINME_VFP", vfp: parsed.vfp };
    }
  } catch {
    // ignore non-JSON messages
  }
  return null;
}

/** Marker string injected into WebView bundle (pathname check). */
const PATH_MARKER_JS = PAYAIRO_COINME_COMPLETE_PATH_MARKER;

/** Injected into WebView: only sends vfp from PayArio complete URL, not Prove?s first-screen vfp. */
export const COINME_WEBVIEW_VFP_INJECTED_JS = `
(function() {
  var MIN_LEN = ${MIN_VFP_LENGTH};
  var PATH_MARKER = ${JSON.stringify(PATH_MARKER_JS)};
  var sent = false;

  function onPayairoCompleteUrl() {
    var p = (window.location.pathname || "");
    return p.indexOf(PATH_MARKER) !== -1;
  }

  function pageText() {
    var body = document.body;
    if (!body) return { text: "", title: "" };
    return {
      text: body.innerText || body.textContent || "",
      title: document.title || ""
    };
  }

  function isCompletePage() {
    var parts = pageText();
    var combined = (parts.text + " " + parts.title).toLowerCase();
    return combined.indexOf("verification complete") !== -1 ||
      parts.text.indexOf("Verification fingerprint received") !== -1;
  }

  function extractVfpFromUrl() {
    if (!onPayairoCompleteUrl()) return null;
    try {
      var v = new URLSearchParams(window.location.search).get("vfp");
      if (v && v.length >= MIN_LEN) return v;
    } catch (e) {}
    var m = (window.location.href || "").match(/[?&]vfp=([^&#'"]+)/);
    if (m && m[1]) {
      try { return decodeURIComponent(m[1]); } catch (e2) { return m[1]; }
    }
    return null;
  }

  function extractVfpFromBody() {
    if (!onPayairoCompleteUrl()) return null;
    if (!isCompletePage()) return null;
    var text = pageText().text;
    var matches = text.match(/[0-9a-fA-F]{32,}(?::[0-9a-fA-F]+)?/g);
    if (!matches || !matches.length) return null;
    var best = matches[0];
    for (var i = 1; i < matches.length; i++) {
      if (matches[i].length > best.length) best = matches[i];
    }
    return best.length >= MIN_LEN ? best : null;
  }

  function trySendVfp() {
    if (sent) return;
    if (!onPayairoCompleteUrl()) return;
    var vfp = extractVfpFromUrl() || extractVfpFromBody();
    if (!vfp || vfp.length < MIN_LEN) return;
    sent = true;
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: "COINME_VFP", vfp: vfp })
    );
  }

  trySendVfp();

  if (document.body) {
    var observer = new MutationObserver(function() {
      trySendVfp();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  true;
})();
`;
