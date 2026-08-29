import fs from "fs/promises";
import { Gif, GifUtil } from "gifwrap";
import path from "path";
import { Jimp } from "jimp";
import { getRatio } from "./ratio";
import sharp from "sharp";
import { GifCombiner, jimpGuardType } from "./GifCombiner";
import { getAssetsDir } from "@/lib/files/useLocation";
import type { JimpRead } from "@/types/Jimp";
import { config } from "@/config"

const BASE_MAX_RES = config.effectMaxResolution;
const maxResTotal = BASE_MAX_RES.height * BASE_MAX_RES.width;

// This needs to be rafctored into a generic function
export async function combineRandomEffect(
  sourceImg: Buffer | JimpRead | Gif,
  scaleInitImage: boolean,
): Promise<Buffer> {
  const dir = getAssetsDir();
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const folders = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(dir, entry.name));
  const randomFolder = folders[Math.floor(Math.random() * folders.length)];

  if (!randomFolder) {
    throw new Error("No asset folders found");
  }

  const ls = await fs.readdir(randomFolder);

  const effectGifs = ls.filter((el) => el.endsWith(".gif"));
  const randomEl = Math.floor(Math.random() * effectGifs.length);
  const randomGif = effectGifs[randomEl];

  if (!randomGif) {
    throw new Error("Random gif")
  }
  const firstGifLoc = path.join(randomFolder, randomGif);

  let targetImg: JimpRead | Gif;
  if (sourceImg instanceof Buffer) {
    const process = await sharp(sourceImg)
      .png({
        colors: config.pngColorCount,
        dither: config.pngDitherLevel,
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
    ratio: config.effectOverlayRatio
  });

  const gif = await combiner.run();
  if (jimpGuardType(gif)) {
    return await gif.getBuffer("image/jpeg");
  }

  return gif.buffer;
}
