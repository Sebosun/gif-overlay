import type { JimpBitmap } from "gifwrap";
import { Jimp } from "jimp";
import type { Placement } from "./placement";
import type { JimpRead } from "./overlayGifImage";
import { getRatio } from "./ratio";
import sharp from "sharp";
import { getPositionsPredictable } from "./positions";

async function ensureRGBA(bitmap: JimpBitmap) {
  const jimp = new Jimp(bitmap);

  return {
    width: jimp.bitmap.width,
    height: jimp.bitmap.height,
    data: jimp.bitmap.data,
    channels: 4,
  };
}

// TODO: Rethink this, for now there's no significant performance improvement
// And the bottleneck is not throwing all stuff into JIMP
export async function createCompositeSharp(
  frame1: JimpBitmap,
  frame2: JimpBitmap,
  placement: Placement,
): Promise<JimpRead> {
  const scale = getRatio({
    baseElem: frame1,
    overlayElem: frame2,
  });

  const base = await ensureRGBA(frame1);
  const overlay = await ensureRGBA(frame2);

  const overlaySharp = sharp(overlay.data, {
    raw: {
      width: overlay.width,
      height: overlay.height,
      channels: 4,
    },
  })
    .resize({
      width: Math.round(overlay.width * scale),
      height: Math.round(overlay.height * scale),
    })
    .png();

  const metadataOverlay = await overlaySharp.metadata();

  const { x, y } = getPositionsPredictable({
    placement,
    base,
    overlay: metadataOverlay,
  });
  const overlayBuffer = await overlaySharp.toBuffer();

  const result = await sharp(base.data, {
    raw: {
      width: base.width,
      height: base.height,
      channels: 4,
    },
  })
    .composite([
      {
        input: overlayBuffer,
        top: x,
        left: y,
      },
    ])
    .png({ colors: 256 })
    .toBuffer();

  const jimpImage = await Jimp.read(result);

  return jimpImage;
}
