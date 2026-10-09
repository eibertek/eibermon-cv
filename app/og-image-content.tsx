import { cv } from "../data/cv";

/** Contenido compartido entre opengraph-image.tsx y twitter-image.tsx (ambos usan next/og). */
export const OG_SIZE = { width: 1200, height: 630 };

const BG = "#a9d6e5";
const PAPER = "#fdfbf4";
const INK = "#2b2a26";
const ACCENT = "#ff7a59";
const ACCENT_INK = "#fff5ef";

export function ogImageElement() {
  const initials = cv.profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: BG,
        fontFamily: "sans-serif",
      }}
    >
      {/* Rombos decorativos: referencia a las baldosas isométricas del juego */}
      <div
        style={{
          position: "absolute",
          top: -90,
          right: -90,
          width: 260,
          height: 260,
          background: PAPER,
          opacity: 0.55,
          transform: "rotate(45deg)",
          borderRadius: 28,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -110,
          right: 140,
          width: 180,
          height: 180,
          background: "rgba(255, 122, 89, 0.35)",
          transform: "rotate(45deg)",
          borderRadius: 22,
          display: "flex",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 0 0 80px",
          width: 760,
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            background: ACCENT,
            color: ACCENT_INK,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 2,
            padding: "8px 20px",
            borderRadius: 999,
            marginBottom: 28,
          }}
        >
          PLAYABLE CV
        </div>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 800, color: INK, lineHeight: 1.05 }}>
          {cv.profile.name}
        </div>
        <div style={{ display: "flex", fontSize: 32, fontWeight: 600, color: INK, opacity: 0.75, marginTop: 14 }}>
          {cv.profile.title.en}
        </div>
        <div style={{ display: "flex", fontSize: 26, color: INK, opacity: 0.6, marginTop: 28, maxWidth: 620 }}>
          Walk a 3D city, catch the Eibermon, and meet the people I worked with.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 440,
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: PAPER,
            fontSize: 96,
            fontWeight: 800,
            color: ACCENT,
            border: `6px solid ${ACCENT}`,
          }}
        >
          {initials}
        </div>
      </div>
    </div>
  );
}
