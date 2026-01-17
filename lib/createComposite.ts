import { type JimpBitmap } from "gifwrap";
import { type Positions } from "./positions";
import type { JimpRead } from "./overlayGifImage";
import { Jimp } from "jimp";

interface CompositeOpts {
  frame1: JimpBitmap;
  frame2: JimpBitmap;
  positions: Positions,
  scale: number
}

export function createCompositeJimp(options: CompositeOpts): JimpRead {
  const { frame1, frame2, positions, scale } = options;

  const frameBase = new Jimp(frame1).clone();
  const frameOverlay = new Jimp(frame2).clone();

  frameOverlay.scale(scale);

  const composite = frameBase.composite(frameOverlay, positions.x, positions.y) as JimpRead;
  return composite;
}
