/**
 * Generates a crisp green sphere PNG for the native boot splash.
 * Run: node scripts/generate-sphere-splash.js
 */
const fs = require("fs");
const path = require("path");

const LOGO_ICON_PATHS = [
  "M18.422 42.6982L0 66.2481V0.751953L18.2437 42.6982H18.422Z",
  "M59.3652 21.7251C59.3652 27.5377 57.0476 32.751 53.2443 36.5861C50.689 39.1628 47.4206 41.0803 43.7956 42.0391L6.35742 0.811876V0.751953C6.59512 0.751953 6.89225 0.751953 7.12996 0.751953H38.5662C50.0353 0.751953 59.3652 10.1599 59.3652 21.7251Z",
  "M38.389 42.6982H18.2437L0 0.751953L21.2744 23.8823L38.389 42.6982Z",
];

const SIZE = 400;
const CENTER = SIZE / 2;
const SPHERE_RADIUS = 175;
// Logo ~50% of sphere diameter = generous inner padding between P and sphere edge (per reference)
const ICON_SCALE = (SPHERE_RADIUS * 0.95) / 67;
const ICON_OFFSET_X = CENTER - 30 * ICON_SCALE;
const ICON_OFFSET_Y = CENTER - 33.5 * ICON_SCALE;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="sphereShadow" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="3" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.18"/>
    </filter>
  </defs>
  <circle cx="${CENTER}" cy="${CENTER}" r="${SPHERE_RADIUS}" fill="#275435" filter="url(#sphereShadow)"/>
  <g transform="translate(${ICON_OFFSET_X}, ${ICON_OFFSET_Y}) scale(${ICON_SCALE})">
    <path d="${LOGO_ICON_PATHS[0]}" fill="white"/>
    <path d="${LOGO_ICON_PATHS[1]}" fill="white"/>
    <path d="${LOGO_ICON_PATHS[2]}" fill="#A9A8A8"/>
  </g>
</svg>`;

const outDir = path.join(__dirname, "..", "assets", "images");
const svgPath = path.join(outDir, "GreenSphereSplash.svg");

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(svgPath, svg);
console.log("Created:", svgPath);

// Try to convert SVG to PNG using sharp
(async () => {
  try {
    const sharp = require("sharp");
    const pngPath = path.join(outDir, "GreenSphereSplash.png");
    await sharp(svgPath)
      .resize(SIZE, SIZE)
      .png()
      .toFile(pngPath);
    console.log("Created PNG:", pngPath);
  } catch (err) {
    console.log("Sharp not found. Install with: npm install sharp --save-dev");
    console.log("Then run: node scripts/generate-sphere-splash.js");
    console.log("Or use the SVG at", svgPath, "and convert manually.");
  }
})();
