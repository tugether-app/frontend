import sharp from "file:///F:/Hack/encode/uxmax/tugether/frontend/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js";
import { mkdirSync } from "node:fs";
const A = "../../tugether referensi/asset";
mkdirSync("public/art/cat", { recursive: true });
mkdirSync("public/art/badge", { recursive: true });
mkdirSync("public/art/state", { recursive: true });

// trim transparent border, resize to target HEIGHT (keep aspect), output png
async function pose(src, out, h) {
  await sharp(src).trim({ threshold: 8 }).resize({ height: h }).png({ compressionLevel: 9 }).toFile(out);
  console.log(out);
}
async function box(src, out, size) { // square-ish, fit by width
  await sharp(src).trim({ threshold: 8 }).resize({ width: size }).png({ compressionLevel: 9 }).toFile(out);
  console.log(out);
}

// Mascot poses (portrait) -> by height
for (const n of ["jar-hero", "jar-empty", "jar-celebrate", "jar-sad"]) await pose(`${A}/p0/${n}.png`, `public/art/${n}.png`, 460);
await pose(`${A}/p1/jar-loading.png`, "public/art/jar-loading.png", 360);
await box(`${A}/p0/coin.png`, "public/art/coin.png", 160);
for (const n of ["step-goal", "step-invite", "step-save"]) await box(`${A}/p1/${n}.png`, `public/art/${n}.png`, 240);

// hero-scene (landscape group) -> by width
await pose(`${A}/tugether-icon/hero-scene.png`, "public/art/hero-scene.png", 460);

// Category icons -> 110 wide
for (const n of ["trip","gift","wedding","birthday","home","community","business","education","emergency","custom"])
  await box(`${A}/tugether-icon/${n}.png`, `public/art/cat/${n}.png`, 110);

// Badges -> 180 wide
for (const n of ["badge-first-deposit","badge-first-goal","badge-first-member","badge-goal-completed","badge-super-saver"])
  await box(`${A}/Reward Badge System/${n}.png`, `public/art/badge/${n}.png`, 180);

// State illustrations -> 320 wide
for (const n of ["empty-members","empty-history","empty-notification","empty-search","maintenance","offline"])
  await box(`${A}/state/${n}.png`, `public/art/state/${n}.png`, 320);

// OG cover (has bg, same 1.90 ratio) -> 1200x630
await sharp(`${A}/p1/og-cover.png`).resize(1200, 630, { fit: "cover" }).png().toFile("public/og.png");
console.log("public/og.png");
