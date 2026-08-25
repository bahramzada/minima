import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourcePath = path.join(
  process.cwd(),
  "node_modules/@phosphor-icons/core/assets/fill/plant-fill.svg",
);
const outputDir = path.join(process.cwd(), "public/icons");
const source = await readFile(sourcePath, "utf8");

await mkdir(outputDir, { recursive: true });

async function createIcon(size, filename) {
  const markSize = Math.round(size * 0.56);
  const offset = Math.round((size - markSize) / 2);
  const mark = source
    .replace("currentColor", "#eef3e2")
    .replace("<svg ", `<svg width="${markSize}" height="${markSize}" `);

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: "#6b7d5a",
    },
  })
    .composite([{ input: Buffer.from(mark), left: offset, top: offset }])
    .png()
    .toFile(path.join(outputDir, filename));
}

await Promise.all([
  createIcon(192, "icon-192.png"),
  createIcon(512, "icon-512.png"),
  createIcon(180, "apple-touch-icon.png"),
]);
