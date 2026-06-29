/* eslint-disable @next/next/no-img-element */

// The jar mascot illustrations (static poses). The live, fill-by-progress jar
// stays as <CoinJar/> (SVG); these are for decorative/state spots.

export type Pose = "hero" | "empty" | "celebrate" | "sad" | "loading";

export function Mascot({
  pose,
  size = 200,
  className = "",
  float = false,
}: {
  pose: Pose;
  size?: number;
  className?: string;
  float?: boolean;
}) {
  return (
    <img
      src={`/art/jar-${pose}.png`}
      alt=""
      aria-hidden
      style={{ height: size, width: "auto" }}
      className={`${float ? "float-slow" : ""} select-none ${className}`}
      draggable={false}
    />
  );
}
