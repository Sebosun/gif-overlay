import { BitmapImage, type JimpBitmap } from "gifwrap";
import { getPositions, type Placement } from "./positions";
import type { JimpRead } from "./overlayGifImage";
import { getRatio } from "./ratio";
import { Jimp } from "jimp";
import sharp from "sharp";
import { chai } from "vitest";

export function createCompositeJimp(
  frame1: JimpBitmap,
  frame2: JimpBitmap,
  placement: Placement,
): JimpRead {
  const scale = getRatio(frame1, frame2);
  const jimpFrameAggregate = new Jimp(frame1).clone();
  const jimpFrameElement = new Jimp(frame2).clone();

  jimpFrameElement.scale(scale);

  const { x, y } = getPositions(
    placement,
    jimpFrameAggregate,
    jimpFrameElement,
  );

  const composite = jimpFrameAggregate.composite(
    jimpFrameElement,
    x,
    y,
  ) as JimpRead;
  return composite;
}

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
  const scale = getRatio(frame1, frame2);

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

  const { x, y } = getPositions(placement, base, metadataOverlay);
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
