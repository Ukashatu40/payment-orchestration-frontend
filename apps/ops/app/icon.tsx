import { ImageResponse } from "next/og";

// The sidebar's signal-lamp mark, reduced to a tile: a lit brass dot ringed
// in ink, matching the "Switchboard" identity — not the default Next.js icon.
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
          background: "#0A0E13",
          borderRadius: 7,
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            border: "2px solid #4FB2E0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#D98E2B" }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
