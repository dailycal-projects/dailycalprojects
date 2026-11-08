/**
 * The settings and rules shared by the two image optimizers, so they convert images the same way:
 * `npm run optimize` (scripts/optimize-image.mjs, with sharp) and the editors' in-browser page
 * (src/pages/editors/image-optimization.astro, with mozjpeg compiled to WebAssembly). Each does its
 * own decoding and encoding, since sharp only runs in Node. See README.md's "Optimizing images".
 */

/** Long edge size limit: larger images are scaled down to fit, never up. */
export const MAX_DIMENSION = 2560;

/**
 * JPEG compression quality, encoded with mozjpeg. Chroma is kept at full resolution (4:4:4) so
 * colored edges in illustrations and text stay crisp.
 */
export const JPEG_QUALITY = 85;

/**
 * Opaque images become JPEGs. JPEG has no transparency, so `npm run optimize` makes an image with
 * any transparent pixels (an icon, logo or cutout drawn over something) a WebP instead, which keeps
 * it: lossy color at the same quality as JPEG, and lossless transparency so edges stay clean.
 * (Lossless PNG only saves a few percent on these, and WebP works in every current browser.) The
 * editors' page only makes JPEGs, flattening transparency onto white.
 */
export const WEBP_QUALITY = 85;

/**
 * An image already in the right format and within MAX_DIMENSION is left as it is unless
 * re-encoding it saves at least this much: re-encoding a lossy image loses a little quality each
 * time, which isn't worth a few percent.
 */
export const MIN_SAVINGS = 0.1;

/** File types either optimizer reads. (In the browser, HEIC/HEIF and TIFF only open in Safari.) */
const SUPPORTED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".tif",
  ".tiff",
  ".gif",
  ".heic",
  ".heif",
]);

// Camera raw formats, which neither optimizer can decode
const RAW_EXTENSIONS = new Set([
  ".cr2",
  ".cr3",
  ".nef",
  ".nrw",
  ".arw",
  ".srf",
  ".sr2",
  ".dng",
  ".orf",
  ".raf",
  ".rw2",
  ".pef",
  ".srw",
  ".raw",
  ".x3f",
]);

/**
 * Throws, explaining what to do instead, unless a file with this (lowercase) extension, e.g.
 * ".png", can be optimized.
 * @param {string} ext
 */
export function checkExtension(ext) {
  if (RAW_EXTENSIONS.has(ext)) {
    throw new Error(
      `${ext} is a camera RAW format, which can't be decoded here. ` +
        `Export it to a JPEG or TIFF first, then run this again on that file.`,
    );
  }
  if (ext === ".svg") {
    throw new Error("Do not optimize svg images: they're already small.");
  }
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    throw new Error(
      `Don't know how to read "${ext}" files. Supported: ${[...SUPPORTED_EXTENSIONS].join(", ")}.`,
    );
  }
}

/**
 * A number of bytes in human-readable form, e.g. "1.4 MB".
 * @param {number} bytes
 */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}

/**
 * The percent change from one number to another, e.g. "-91.3%".
 * @param {number} before
 * @param {number} after
 */
export function formatChange(before, after) {
  const sign = after <= before ? "-" : "+";
  return `${sign}${Math.abs((1 - after / before) * 100).toFixed(1)}%`;
}
