import fs from "fs/promises";
import { GifUtil } from "gifwrap";
import path from "path";
import { type JimpRead } from "../lib/overlayGifImage";
import { Jimp } from "jimp";
import { GifCombiner, jimpGuardType } from "./GifCombiner";
import { getRatio } from "./ratio";
import { RandomPlacement } from "./placement";

const ASSETS_DIR = "assets/";
const BASE_MAX_RES = { height: 800, width: 800 };
const maxResTotal = BASE_MAX_RES.height * BASE_MAX_RES.width;

export async function combineRandomImages(
  sourceImg: Buffer | JimpRead,
  scaleInitImage?: boolean,
): Promise<Buffer | null> {
  const mainPath = path.resolve(`${__dirname}/../`);
  const dir = path.join(mainPath, ASSETS_DIR);
  const ls = await fs.readdir(dir);

  const randomGifs = [] as string[];

  const randomPlacements = new RandomPlacement();

  console.log("Getting random gifs");
  for (const folder of ls) {
    const folderPath = path.join(dir, folder);
    const items = await fs.readdir(folderPath);
    const gifs = items.filter((el) => el.endsWith(".gif"));

    const randomEl = Math.floor(Math.random() * gifs.length);
    const randomGif = gifs[randomEl];
    if (randomGif) {
      const gifPath = path.join(folderPath, randomGif);
      randomGifs.push(gifPath);
    }
  }

  let targetImg: JimpRead;
  if (sourceImg instanceof Buffer) {
    const read = await Jimp.read(sourceImg);
    const isBiggerThanNecessary = read.width * read.height > maxResTotal;
    if (scaleInitImage && isBiggerThanNecessary) {
      const res = getRatio({ baseElem: BASE_MAX_RES, overlayElem: read });
      read.scale(res);
    }

    targetImg = read;
  } else {
    targetImg = sourceImg as JimpRead;
  }

  const firstGifLoc = randomGifs.pop();

  if (!firstGifLoc) {
    console.error("Couldnt get the first gif...");
    return null;
  }

  const firstGif = await GifUtil.read(firstGifLoc);
  const placement = randomPlacements.get();

  const combiner = new GifCombiner({
    base: targetImg,
    overlay: firstGif,
    placement: placement,
    randomizePositions: true
  });

  let gif = await combiner.run();

  for (const el of randomGifs) {
    const placement = randomPlacements.get();
    const gifElem = await GifUtil.read(el);

    const combiner = new GifCombiner({
      base: gif,
      overlay: gifElem,
      placement: placement,
      randomizePositions: true
    });

    gif = await combiner.run();
  }

  if (jimpGuardType(gif)) {
    return await gif.getBuffer("image/jpeg");
  }

  return gif.buffer;
}
