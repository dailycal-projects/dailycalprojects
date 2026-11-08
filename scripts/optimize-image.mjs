#!/usr/bin/env node
/**
 * Image optimization pipeline.
 * Converts one or more images in place to web-optimized JPEG (or, for images with
 * transparent pixels, WebP), deleting the original unless --keep-original is
 * given. An image that's already optimized (re-encoding it would save less than
 * MIN_SAVINGS) is left as it is, so it's safe to run on every image. The settings
 * are shared with the editors' in-browser optimizer, in src/lib/image-optimization.mjs.
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
import {
  JPEG_QUALITY,
  MAX_DIMENSION,
  MIN_SAVINGS,
  WEBP_QUALITY,
  checkExtension,
  formatBytes,
  formatChange,
} from "../src/lib/image-optimization.mjs";

// Optimize a single image file
async function optimizeOne(inputPath, { keepOriginal }) {
  const resolvedInput = path.resolve(inputPath);
  const ext = path.extname(resolvedInput).toLowerCase();

  checkExtension(ext);

  const originalStat = await stat(resolvedInput);
  const input = sharp(resolvedInput, { failOn: "none" });
  const { format, autoOrient } = await input.metadata();
  const { isOpaque } = await input.stats();
  const outputFormat = isOpaque ? "jpeg" : "webp";
  const outputExt = isOpaque ? ".jpg" : ".webp";

  const dir = path.dirname(resolvedInput);
  // extname() keeps the original case (ext is lowercased), so .JPG files lose their extension too
  const base = path.basename(resolvedInput, path.extname(resolvedInput));
  const outputPath = path.join(dir, `${base}${outputExt}`);

  const tempPath = path.join(dir, `.${base}.${randomBytes(4).toString("hex")}.tmp${outputExt}`);

  const resized = sharp(resolvedInput, { failOn: "none" }).rotate().resize({
    width: MAX_DIMENSION,
    height: MAX_DIMENSION,
    fit: "inside",
    withoutEnlargement: true,
  });
  await (
    isOpaque
      ? resized.jpeg({ quality: JPEG_QUALITY, mozjpeg: true, chromaSubsampling: "4:4:4" })
      : resized.webp({ quality: WEBP_QUALITY, alphaQuality: 100, smartSubsample: true, effort: 6 })
  ).toFile(tempPath);

  const newStat = await stat(tempPath);

  const replacingSelf = resolvedInput === outputPath;

  // Already optimized: within MAX_DIMENSION, and either already in the output format with
  // re-encoding saving less than MIN_SAVINGS, or (e.g. a tiny transparent PNG icon) re-encoding
  // would make it bigger
  const withinSize = Math.max(autoOrient.width, autoOrient.height) <= MAX_DIMENSION;
  const savings = 1 - newStat.size / originalStat.size;
  const alreadyOptimized =
    withinSize &&
    ((replacingSelf && format === outputFormat && savings < MIN_SAVINGS) || savings <= 0);
  if (alreadyOptimized) {
    await unlink(tempPath);
    return {
      inputPath: resolvedInput,
      outputPath,
      originalSize: originalStat.size,
      newSize: originalStat.size,
      keptOriginal: false,
      alreadyOptimized: true,
    };
  }
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

      if (result.alreadyOptimized) {
        console.log(
          `\n${path.relative(process.cwd(), result.inputPath)}: already optimized, left as is`,
        );
        continue;
      }
      console.log(
        `\n${path.relative(process.cwd(), result.inputPath)} → ${path.relative(process.cwd(), result.outputPath)}`,
      );
      console.log(`  original: ${formatBytes(result.originalSize)}`);
      console.log(`  new:      ${formatBytes(result.newSize)}`);
      console.log(`  change:   ${formatChange(result.originalSize, result.newSize)}`);
      if (result.keptOriginal) console.log(`  (original kept, per --keep-original)`);
    } catch (err) {
      failures.push({ inputPath, error: err });
      console.error(`\n${inputPath}: FAILED — ${err.message}`);
    }
  }

  if (results.length > 1) {
    const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalNew = results.reduce((sum, r) => sum + r.newSize, 0);
    console.log(
      `\n${results.length} image(s): ${formatBytes(totalOriginal)} → ${formatBytes(totalNew)} (${formatChange(totalOriginal, totalNew)})`,
    );
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} of ${paths.length} failed.`);
    process.exitCode = 1;
  }
}

main();
