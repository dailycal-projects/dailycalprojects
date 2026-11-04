import sharp from "sharp";

/**
 * The size of an image in public/, by its site path (e.g. "/assets/images/my-story.jpg"), read at
 * build time for social preview tags. Undefined for an external URL.
 */
export async function publicImageSize(
  path: string,
): Promise<{ width: number; height: number } | undefined> {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return undefined;
  }
  const { autoOrient } = await sharp(`public${path}`).metadata();
  return autoOrient;
}
