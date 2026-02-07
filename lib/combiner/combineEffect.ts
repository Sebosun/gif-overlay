import fs from "fs/promises";
import { Gif, GifUtil } from "gifwrap";
import path from "path";
import { Jimp } from "jimp";
import { getRatio } from "./ratio";
import sharp from "sharp";
import type { JimpRead } from "types/Jimp";
import { GifCombiner, jimpGuardType } from "./GifCombiner";
import { getEffectsDir } from "lib/files/useLocation";

const BASE_MAX_RES = { height: 800, width: 800 };
const maxResTotal = BASE_MAX_RES.height * BASE_MAX_RES.width;

// This needs to be rafctored into a generic function
export async function combineRandomEffect(
  sourceImg: Buffer | JimpRead | Gif,
  scaleInitImage: boolean,
): Promise<Buffer> {
  const dir = getEffectsDir()
  const ls = await fs.readdir(dir);

  const effectGifs = ls.filter((el) => el.endsWith(".gif"));
  const randomEl = Math.floor(Math.random() * effectGifs.length);
  const randomGif = effectGifs[randomEl];

  if (!randomGif) {
    throw new Error("Random gif")
  }
  const firstGifLoc = path.join(dir, randomGif);

  let targetImg: JimpRead | Gif;
  if (sourceImg instanceof Buffer) {
    const process = await sharp(sourceImg)
      .png({
        colors: 256,
        dither: 1,
      })
      .toBuffer();

    const read = await Jimp.read(process);
    const isBiggerThanNecessary = read.width * read.height > maxResTotal;
    if (scaleInitImage && isBiggerThanNecessary) {
      const res = getRatio({ baseElem: BASE_MAX_RES, overlayElem: read });
      read.scale(res);
    }

    targetImg = read;
  } else {
    targetImg = sourceImg as JimpRead | Gif;
  }

  if (!firstGifLoc) {
    throw new Error("Couldnt get the first gif...")
  }

  const firstGif = await GifUtil.read(firstGifLoc);

  const combiner = new GifCombiner({
    base: targetImg,
    overlay: firstGif,
    placement: 'center',
    randomizePositions: false,
    ratio: 1.5
  });

  const gif = await combiner.run();
  if (jimpGuardType(gif)) {
    return await gif.getBuffer("image/jpeg");
  }

  return gif.buffer;
}
