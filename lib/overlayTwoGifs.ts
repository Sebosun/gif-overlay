import { Jimp, type JimpInstance } from "jimp";
import { GifFrame, GifCodec, Gif, GifUtil } from "gifwrap";
import fs from "fs/promises";
import { getPositions, type Placement } from "./positions";

export async function overlayTwoGifs(
  gifPrimary: Gif,
  gifSecondary: Gif,
  placement: Placement = "bottom-right",
) {
  const codec = new GifCodec();

  const primarySize = gifPrimary.height * gifPrimary.width;
  const secondarySize = gifSecondary.height * gifSecondary.width;

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

      jimpFrameSecondary.scale(10);
      console.log(jimpFrameSecondary.height, jimpFrameSecondary.width);

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

  framesAcc.forEach((frame) => {
    console.log("Quantizing that dekker");
    GifUtil.quantizeDekker(frame, 256); // quantize the image
  });

  console.log("Constructing new gif");
  const newGif = await codec.encodeGif(framesAcc, { loops: 0 });

  await fs.writeFile("result.gif", newGif.buffer);
}

const gif_1 = await GifUtil.read(`../examples/example-17.gif`);
const gif_2 = await GifUtil.read(`../scripts/anime/132249.gif`);
overlayTwoGifs(gif_1, gif_2);
