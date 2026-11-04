import sharp from "sharp";
import { stat } from "node:fs/promises";
import { basename, extname, dirname, join } from "node:path";
import { imageOptimization } from "../src/config/images.ts";

/**
 * Optimizes an images size so that the size of this GitHub repository doesn't get out of hand.
 * Uses the same settings as the in-browser optimizer (src/pages/editors/image-optimization.astro),
 * from src/config/images.ts.
 * @param input The path to the image to format. Must be png or jpg/jpeg.
 * @param targetWidth The max width of the optimized image.
 * @param avifQuality 0-100.
 * @param avifEffort 0-9, higher = slower but smaller (default 9).
 */
async function optimizeImage(
  input: string,
  targetWidth: number = imageOptimization.maxWidth,
  avifQuality: number = imageOptimization.avifQuality,
  avifEffort: number = 9,
): Promise<void> {
  const ext = extname(input).toLowerCase();
  if (!imageOptimization.inputExtensions.includes(ext)) {
    console.error(
      `Unsupported format "${ext}". Provide one of: ${imageOptimization.inputExtensions.join(", ")}.`,
    );
    process.exit(1);
  }

  const dir = dirname(input);
  const name = basename(input, extname(input));
  const output = join(dir, `${name}.avif`);

  const image = sharp(input, { failOn: "none" });
  const meta = await image.metadata();

  // autoOrient: the dimensions after EXIF rotation (a rotated portrait photo's raw width is its height)
  const { width, height } = meta.autoOrient;
  const needsResize = width > targetWidth;

  // sharp strips all metadata (EXIF, IPTC, XMP, ICC) by default — GPS, timestamps,
  // camera info, etc. are all removed. .rotate() auto-orients pixels from EXIF first.
  const pipeline = image
    .rotate()
    .resize(needsResize ? { width: targetWidth, withoutEnlargement: true } : undefined)
    .avif({
      quality: avifQuality,
      effort: avifEffort,
      chromaSubsampling: "4:2:0", // halves chroma resolution — imperceptible on photos
    });

  const { size: outSize } = await pipeline.toFile(output);
  const { size: inSize } = await stat(input);
  const pct = ((1 - outSize / inSize) * 100).toFixed(1);

  console.log(`  in:  ${input} (${fmt(inSize)}, ${width}x${height})`);
  const outWidth = needsResize ? targetWidth : width;
  const outHeight = needsResize ? Math.round(height * (targetWidth / width)) : height;
  console.log(`  out: ${output} (${fmt(outSize)}, ${outWidth}x${outHeight})`);
  console.log(`  saved ${pct}%`);
}

function fmt(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }
  return `${(kb / 1024).toFixed(2)} MB`;
}

const input = process.argv[2];
if (!input) {
  console.error("Usage: npm run optimize <image.(jpg|png)>");
  process.exit(1);
}

await optimizeImage(input);
