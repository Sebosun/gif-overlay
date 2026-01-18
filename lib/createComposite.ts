import { type JimpBitmap } from "gifwrap";
import { type Positions } from "./positions";
import { Jimp } from "jimp";
import type { JimpRead } from "../types/Jimp";

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
