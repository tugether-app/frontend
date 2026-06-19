import sharp from "file:///F:/Hack/encode/uxmax/tugether/frontend/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js";
import { mkdirSync } from "node:fs";
const SRC = "../../tugether referensi/icon/icon app (3).png";
mkdirSync("public", { recursive: true });
const bg = { r: 0xFB, g: 0xFA, b: 0xF7, alpha: 1 };
const jobs = [
  ["public/icon-192.png", 192, false],
  ["public/icon-512.png", 512, false],
  ["public/icon-maskable-512.png", 512, true],
  ["app/icon.png", 256, false],
  ["app/apple-icon.png", 180, false],
  ["public/favicon-32.png", 32, false],
];
for (const [out, size, maskable] of jobs) {
  let img;
  if (maskable) {
    const inner = Math.round(size * 0.78);
    const pad = Math.round((size - inner) / 2);
    img = sharp(SRC).resize(inner, inner, { fit: "contain", background: bg })
      .extend({ top: pad, bottom: pad, left: pad, right: pad, background: bg });
  } else {
    img = sharp(SRC).resize(size, size, { fit: "contain", background: bg });
  }
  await img.flatten({ background: bg }).png().toFile(out);
  console.log("wrote", out, size);
}
