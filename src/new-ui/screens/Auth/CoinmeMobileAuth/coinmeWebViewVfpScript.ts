/** PayAiro redirect after Prove mobile-auth completes. */
export const PAYAIRO_COINME_COMPLETE_PATH_MARKER = "prove-2fa/complete";

/** PayAiro redirect after instant-link SMS flow completes. */
export const PAYAIRO_INSTANT_LINK_COMPLETE_PATH_MARKER = "instant-link/complete";

export type Coinme2faAuthMethod = "mobile_auth" | "instant_link";

/** @deprecated Prefer PAYAIRO_COINME_COMPLETE_PATH_MARKER */
export const COMPLETE_PATH = "/coinme/prove/2fa/complete";

const MIN_VFP_LENGTH = 32;

export type CoinmeWebViewMessage = {
  type: "COINME_VFP";
  vfp: string;
};

export type BuildCoinmeVfpInjectedJsOptions = {
  pathMarkers: string[];
  /** Instant-link only: extract vfp from complete HTML when path does not match. */
  allowContentOnlyComplete?: boolean;
};

function normalizePathMarkers(
  pathMarkers: string | string[]
): string[] {
  return Array.isArray(pathMarkers) ? pathMarkers : [pathMarkers];
}

export function getCompletePathMarkers(
  authMethod: Coinme2faAuthMethod
): string[] {
  if (authMethod === "instant_link") {
    return [
      PAYAIRO_INSTANT_LINK_COMPLETE_PATH_MARKER,
      PAYAIRO_COINME_COMPLETE_PATH_MARKER,
    ];
  }
  return [PAYAIRO_COINME_COMPLETE_PATH_MARKER];
}

/** @deprecated Use getCompletePathMarkers */
export function getCompletePathMarker(
  authMethod: Coinme2faAuthMethod
): string {
  return getCompletePathMarkers(authMethod)[0];
}

export function isPayAiroCompleteUrl(
  url: string,
  pathMarkers: string | string[]
): boolean {
  if (!url) return false;
  const markers = normalizePathMarkers(pathMarkers);
  if (!markers.length) return false;
  try {
    const u = new URL(url);
    return markers.some((m) => u.pathname.includes(m));
  } catch {
    return markers.some((m) => url.includes(m));
  }
}

/** @deprecated Use isPayAiroCompleteUrl(url, PAYAIRO_COINME_COMPLETE_PATH_MARKER) */
export function isPayAiroCoinmeCompleteUrl(url: string): boolean {
  return isPayAiroCompleteUrl(url, PAYAIRO_COINME_COMPLETE_PATH_MARKER);
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

export function tryFinishVfpFromUrl(
  url: string,
  pathMarkers: string | string[]
): string | null {
  if (!url || !isPayAiroCompleteUrl(url, pathMarkers)) return null;
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

export function buildCoinmeVfpInjectedJs(
  pathMarkerOrOptions: string | BuildCoinmeVfpInjectedJsOptions
): string {
  const options: BuildCoinmeVfpInjectedJsOptions =
    typeof pathMarkerOrOptions === "string"
      ? { pathMarkers: [pathMarkerOrOptions] }
      : pathMarkerOrOptions;

  const pathMarkers = options.pathMarkers;
  const allowContentOnly = options.allowContentOnlyComplete === true;

  return `
(function() {
  var MIN_LEN = ${MIN_VFP_LENGTH};
  var PATH_MARKERS = ${JSON.stringify(pathMarkers)};
  var ALLOW_CONTENT_ONLY = ${allowContentOnly ? "true" : "false"};
  var sent = false;

  function pathnameMatchesMarker() {
    var p = (window.location.pathname || "");
    for (var i = 0; i < PATH_MARKERS.length; i++) {
      if (p.indexOf(PATH_MARKERS[i]) !== -1) return true;
    }
    return false;
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

  function onPayairoCompleteUrl() {
    if (pathnameMatchesMarker()) return true;
    if (ALLOW_CONTENT_ONLY && isCompletePage()) return true;
    return false;
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
}

/** Default injected script for mobile-auth complete path. */
export const COINME_WEBVIEW_VFP_INJECTED_JS = buildCoinmeVfpInjectedJs({
  pathMarkers: [PAYAIRO_COINME_COMPLETE_PATH_MARKER],
});
