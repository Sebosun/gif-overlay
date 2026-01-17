import { Jimp } from "jimp";
import { GifFrame, GifCodec, Gif, GifUtil } from "gifwrap";
import { getPositionsPredictable } from "./positions";
import type { Placement } from "./placement";

export type JimpRead = Awaited<ReturnType<typeof Jimp.read>>;

export async function overlayGif(
  base: JimpRead,
  overlay: Gif,
  placement: Placement,
) {
  const codec = new GifCodec();

  const frames = overlay.frames.map((frame) => {
    const frameJimp = new Jimp(frame.bitmap);
    const composite = base.clone();

    const { x, y } = getPositionsPredictable({
      placement: placement,
      base: base,
      overlay: overlay,
    });

    composite.composite(frameJimp, x, y);

    return new GifFrame(composite.bitmap, {
      delayCentisecs: frame.delayCentisecs,
    });
  });

  GifUtil.quantizeDekker(frames, 256); // quantize the image

  return await codec.encodeGif(frames, { loops: 0 });
}
