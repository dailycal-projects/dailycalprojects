/** Build-time helpers for images imported from src/assets/. */
import sharp from "sharp";

/** The file an image was imported from, e.g. "/.../src/assets/authors/ji-yeon-woo.jpg". */
export function imageFile(image: ImageMetadata): string {
  return (image as ImageMetadata & { fsPath?: string }).fsPath ?? image.src.split("?")[0];
}

// The card's shape, at the size the old Gatsby site cropped its card images at
const CARD = { width: 450, height: 250 };

/**
 * How a featured image fills an article's card (on the homepage, author pages and search results):
 * the size to make it, which covers the card's shape without cropping, and the `object-position`
 * that shows the part of it the card does. That's its most eye-catching part, as sharp's
 * "attention" strategy finds it at the card's size, as on the old Gatsby site, rather than its
 * center.
 *
 * The card's CSS does the cropping (`object-fit: cover`), so that every size of the image (1x and
 * 2x) shows the same part of it. (Cropping each size's file separately doesn't: what attention
 * finds depends on the size it's run at.)
 */
export async function cardImage(
  image: ImageMetadata,
): Promise<{ width: number; height: number; position: string }> {
  const { info } = await sharp(imageFile(image))
    .rotate()
    .resize({ ...CARD, fit: "cover", position: "attention" })
    .toBuffer({ resolveWithObject: true });
  const scale = Math.max(CARD.width / image.width, CARD.height / image.height);
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);
  // sharp gives how far the crop is from the image's top-left corner (negated), in pixels
  const percent = (offset = 0, spare: number) =>
    spare > 0 ? `${Math.round((Math.abs(offset) / spare) * 1000) / 10}%` : "50%";
  return {
    width,
    height,
    position: `${percent(info.cropOffsetLeft, width - CARD.width)} ${percent(info.cropOffsetTop, height - CARD.height)}`,
  };
}
