import { Jimp } from "jimp";
import { GifFrame, GifCodec, Gif, GifUtil } from "gifwrap";
import { getPositions, type Placement } from "./positions";

interface OverlayOpts {
  gifPrimary: Gif;
  gifSecondary: Gif;
  placement: Placement;
}

// TODO: Make sure the image doesn't cover too much of the image
// Or be fine with it if it's transparent
// For certain effects, it may be okay to fullsdcreen them, add option for that
export async function overlayTwoGifs(options: OverlayOpts): Promise<Gif> {
  const { gifPrimary, gifSecondary, placement } = options;
  const codec = new GifCodec();

  const primarySize = gifPrimary.height * gifPrimary.width;
  const secondarySize = gifSecondary.height * gifSecondary.width;

  // gifPrimary.usesTransparency -- if at least one frame contains one transparent pixel

  let biggerImage: Gif;
  let smallerImage: Gif;

  if (primarySize > secondarySize) {
    biggerImage = gifPrimary;
    smallerImage = gifSecondary;
  } else {
    biggerImage = gifSecondary;
    smallerImage = gifPrimary;
  }

  const totalFrames =
    gifPrimary.frames.length > gifSecondary.frames.length
      ? gifPrimary.frames.length
      : gifSecondary.frames.length;

  let framesAcc = [] as GifFrame[];

  // looping over two gifs
  for (let i = 0; i < totalFrames; i++) {
    let biggerFramesIdx = i;
    let smallerFrameIdx = i;

    if (i > biggerImage.frames.length) {
      biggerFramesIdx = (i % biggerImage.frames.length) - 1; // modulo so it wraps, -1 cause its an array
    }

    if (i > smallerImage.frames.length) {
      smallerFrameIdx = (i % smallerImage.frames.length) - 1; // modulo so it wraps, -1 cause its an array
    }

    const mainFrame = biggerImage.frames[biggerFramesIdx];
    const childFrame = smallerImage.frames[smallerFrameIdx];

    if (mainFrame && childFrame) {
      const jimpFrameMain = new Jimp(mainFrame.bitmap).clone();
      const jimpFrameSecondary = new Jimp(childFrame.bitmap).clone();

      const { x, y } = getPositions(
        placement,
        jimpFrameMain,
        jimpFrameSecondary,
      );

      const composite = jimpFrameMain.composite(jimpFrameSecondary, x, y);

      framesAcc.push(
        new GifFrame(composite.bitmap, {
          delayCentisecs: mainFrame.delayCentisecs,
        }),
      );
    }
  }

  GifUtil.quantizeDekker(framesAcc, 256); // quantize the image

  console.log("Constructing new gif");
  const newGif = await codec.encodeGif(framesAcc, { loops: 0 });

  return newGif;
}
