import { ImageResponse } from "next/og";

// Social share card, generated at build (no asset needed). Next wires this for
// both Open Graph and Twitter automatically.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Tugether - Save together, reach the goal";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg,#FFFCF4 0%,#FBF6EC 100%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 620 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "#F4B740" }} />
            <span style={{ fontSize: 30, fontWeight: 700, color: "#2B2622" }}>tugether</span>
          </div>
          <div style={{ fontSize: 74, fontWeight: 800, color: "#2B2622", lineHeight: 1.05, marginTop: 28 }}>
            Save together,
          </div>
          <div style={{ fontSize: 74, fontWeight: 800, color: "#E09A1E", lineHeight: 1.05 }}>
            reach the goal.
          </div>
          <div style={{ fontSize: 28, color: "#8A8178", marginTop: 28, lineHeight: 1.4 }}>
            Pool money toward one shared goal. No wallet, just email.
          </div>
        </div>

        {/* Jar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 150, height: 26, borderRadius: 13, background: "#FBF6EC", border: "4px solid #ECE7DE" }} />
          <div
            style={{
              width: 280,
              height: 290,
              marginTop: -8,
              borderRadius: 60,
              background: "#FFFFFF",
              border: "5px solid #ECE7DE",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 175,
                background: "linear-gradient(180deg,#FFD976,#E09A1E)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                gap: 14,
                paddingTop: 18,
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 20, background: "#FFE39A", border: "4px solid #E09A1E" }} />
              <div style={{ width: 40, height: 40, borderRadius: 20, background: "#FFD976", border: "4px solid #E09A1E" }} />
              <div style={{ width: 40, height: 40, borderRadius: 20, background: "#FFE39A", border: "4px solid #E09A1E" }} />
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
