#!/usr/bin/env node
/**
 * Image optimization pipeline.
 * Converts one or more images in place to web-optimized JPEG, deleting the 
 * original unless --keep-original is given.
 *
 * Usage:
 *   npm run optimize -- <image> [<image> ...] [--keep-original]
 *
 * (the "--" is required so npm forwards the flag/paths instead of trying to
 * parse them itself)
 *
 * See README.md's "Optimizing images" section for what this does and why.
 */
import { rename, stat, unlink } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import sharp from "sharp";

// Long edge size limit. 
const MAX_DIMENSION = 2560;

// JPEG compression quality (encoded with mozjpeg). Chroma is kept at full
// resolution (4:4:4) so colored edges in illustrations and text stay crisp.
const JPEG_QUALITY = 85;

// JPEG has no transparency, so transparent pixels are flattened onto the
// site's white page background.
const FLATTEN_BACKGROUND = "#ffffff";

// Raw camera formats aren't decodable, so we will throw specifically for these.
const KNOWN_RAW_EXTENSIONS = new Set([
  ".cr2", ".cr3", ".nef", ".nrw", ".arw", ".srf", ".sr2", ".dng",
  ".orf", ".raf", ".rw2", ".pef", ".srw", ".raw", ".x3f",
]);

// Extensions supported by this script.
const SUPPORTED_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff", ".gif",
  ".heic", ".heif",
]);

// Formats a number of bytes into human-readable form
function formatBytes(bytes) {
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

// Optimize a single image file
async function optimizeOne(inputPath, { keepOriginal }) {
  const resolvedInput = path.resolve(inputPath);
  const ext = path.extname(resolvedInput).toLowerCase();

  // Throw if this is a raw camera image format
  if (KNOWN_RAW_EXTENSIONS.has(ext)) {
    throw new Error(
      `${ext} is a camera RAW format, which this project's image library can't decode. ` +
        `Export it to a JPEG or TIFF first, then run this again on that file.`,
    );
  }

  // Do not optimize svg images
  if (ext === ".svg") {
    throw new Error("Do not optimize svg images.");
  }

  // Throw if this is an unsupported format
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    throw new Error(
      `Don't know how to read "${ext}" files. Supported: ${[...SUPPORTED_EXTENSIONS].join(", ")}.`,
    );
  }

  const originalStat = await stat(resolvedInput);
  const dir = path.dirname(resolvedInput);
  const base = path.basename(resolvedInput, ext);
  const outputPath = path.join(dir, `${base}.jpg`);

  const tempPath = path.join(dir, `.${base}.${randomBytes(4).toString("hex")}.tmp.jpg`);

  await sharp(resolvedInput, { failOn: "none" })
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .flatten({ background: FLATTEN_BACKGROUND })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(tempPath);

  const newStat = await stat(tempPath);

  const replacingSelf = resolvedInput === outputPath;
  if (!keepOriginal && !replacingSelf) {
    await unlink(resolvedInput);
  }
  await rename(tempPath, outputPath);

  return {
    inputPath: resolvedInput,
    outputPath,
    originalSize: originalStat.size,
    newSize: newStat.size,
    keptOriginal: keepOriginal && !replacingSelf,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const keepOriginal = args.includes("--keep-original");
  const paths = args.filter((a) => a !== "--keep-original");

  if (paths.length === 0) {
    console.error("Usage: npm run optimize -- <image> [<image> ...] [--keep-original]");
    process.exitCode = 1;
    return;
  }

  const results = [];
  const failures = [];

  for (const inputPath of paths) {
    try {
      const result = await optimizeOne(inputPath, { keepOriginal });
      results.push(result);

      const percent = (
        (1 - result.newSize / result.originalSize) *
        100
      ).toFixed(1);
      const sign = result.newSize <= result.originalSize ? "-" : "+";

      console.log(`\n${path.relative(process.cwd(), result.inputPath)} → ${path.relative(process.cwd(), result.outputPath)}`);
      console.log(`  original: ${formatBytes(result.originalSize)}`);
      console.log(`  new:      ${formatBytes(result.newSize)}`);
      console.log(`  change:   ${sign}${Math.abs(percent)}%`);
      if (result.keptOriginal) console.log(`  (original kept, per --keep-original)`);
    } catch (err) {
      failures.push({ inputPath, error: err });
      console.error(`\n${inputPath}: FAILED — ${err.message}`);
    }
  }

  if (results.length > 1) {
    const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalNew = results.reduce((sum, r) => sum + r.newSize, 0);
    const totalPercent = ((1 - totalNew / totalOriginal) * 100).toFixed(1);
    console.log(
      `\n${results.length} image(s): ${formatBytes(totalOriginal)} → ${formatBytes(totalNew)} (-${totalPercent}%)`,
    );
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} of ${paths.length} failed.`);
    process.exitCode = 1;
  }
}

main();
