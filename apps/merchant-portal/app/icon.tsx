import { ImageResponse } from "next/og";

// The sidebar's wax-seal mark, reduced to a tile: a checkmark on ink-green —
// "the manifest is stamped", matching the identity — not the default Next.js icon.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1F5F49",
          borderRadius: 7,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12.5 10 17.5 19 7"
            stroke="#FBFBF9"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
