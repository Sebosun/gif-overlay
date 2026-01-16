import type { JimpBitmap } from "gifwrap";
import { getPositions, type Placement } from "./positions";
import type { JimpRead } from "./overlayGifImage";
import { getRatio } from "./ratio";
import { Jimp } from "jimp";

export function createCompositeJimp(
  frame1: JimpBitmap,
  frame2: JimpBitmap,
  placement: Placement,
): JimpRead {
  const scale = getRatio(frame1, frame2);
  const jimpFrameAggregate = new Jimp(frame1).clone();
  const jimpFrameElement = new Jimp(frame2).clone();

  if (scale !== 1) {
    jimpFrameElement.scale(scale);
  }

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
