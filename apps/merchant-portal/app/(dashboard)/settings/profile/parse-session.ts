// A raw User-Agent string is implementation detail, not something a
// merchant should have to read to recognise their own sign-ins. This maps
// it to a short "Browser on OS" label and picks the right icon — good
// enough for the common cases (browsers, curl/API clients); anything else
// falls back to "Unknown device" rather than showing raw junk.

export type DeviceKind = "desktop" | "mobile" | "api";

export interface ParsedSession {
  label: string;
  kind: DeviceKind;
}

function detectOS(ua: string): string | null {
  if (/iPhone|iPad/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Windows/.test(ua)) return "Windows";
  if (/Linux/.test(ua)) return "Linux";
  return null;
}

function detectBrowser(ua: string): string | null {
  if (/HeadlessChrome/.test(ua)) return "Chrome (automated)";
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\//.test(ua)) return "Opera";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  // Chrome/Edge/Opera UAs also contain "Safari/xxx" as a legacy token —
  // only a REAL Safari lacks all of the above.
  if (/Safari\//.test(ua)) return "Safari";
  return null;
}

export function parseSession(userAgent: string | null): ParsedSession {
  if (!userAgent) return { label: "Unknown device", kind: "desktop" };

  const curlMatch = /^curl\/([\d.]+)/.exec(userAgent);
  if (curlMatch) return { label: `API client (curl ${curlMatch[1]})`, kind: "api" };
  if (/^(PostmanRuntime|insomnia|HTTPie|Bruno)/i.test(userAgent)) {
    return { label: "API client", kind: "api" };
  }

  const os = detectOS(userAgent);
  const browser = detectBrowser(userAgent);
  const kind: DeviceKind = os === "iOS" || os === "Android" ? "mobile" : "desktop";

  if (browser && os) return { label: `${browser} on ${os}`, kind };
  if (browser) return { label: browser, kind };
  if (os) return { label: `Device on ${os}`, kind };
  return { label: "Unknown device", kind: "desktop" };
}
