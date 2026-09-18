import type { NextConfig } from "next";

// Content-Security-Policy is set per-request in proxy.ts instead (it needs a
// fresh nonce every request — see guides/content-security-policy.md). Only
// the static, non-nonce headers live here.
const nextConfig: NextConfig = {
  transpilePackages: ["@payflow/ui", "@payflow/api-client", "@payflow/auth"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
