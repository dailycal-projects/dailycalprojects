// Image optimization settings, shared by the command-line optimizer (scripts/optimize.ts) and the
// in-browser one (src/pages/editors/image-optimization.astro), so both produce the same output.

export const imageOptimization = {
  /** Images wider than this are scaled down to it (never up). 2x the widest article image. */
  maxWidth: 1280,
  /** AVIF quality, 0-100. */
  avifQuality: 62,
  /** Extensions the optimizers accept. */
  inputExtensions: [".jpg", ".jpeg", ".png"],
};
