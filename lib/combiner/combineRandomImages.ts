import fs from "fs/promises";
import { Gif, GifUtil } from "gifwrap";
import path from "path";
import { Jimp } from "jimp";
import { getRatio } from "./ratio";
import sharp from "sharp";
import type { JimpRead } from "types/Jimp";
import { GifCombiner, jimpGuardType } from "./GifCombiner";
import { type Placement, RandomPlacement } from "./placement";
import { getEffectsDir, getRandomDir, getTomatoDir } from "lib/files/useLocation";

const BASE_MAX_RES = { height: 600, width: 600 };
const maxResTotal = BASE_MAX_RES.height * BASE_MAX_RES.width;

// If it breaks here idc because the bot wont even start
export async function combineRandomImagesFactory(sourceImg: Buffer | JimpRead | Gif, scaleInitImage: boolean, isRandom: boolean,): Promise<Buffer> {
  const randomGifs = [] as string[];

  const dir = getRandomDir()
  const ls = await fs.readdir(dir);

  // TODO: refactor so it doesnt fs.readfiles everytime this function launches
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

  return await combineRandomImages({ sourceImg, scaleInitImage, randomizePositions: isRandom, gifsToCombine: randomGifs })
}

export async function combineRandomEffectFactory(sourceImg: Buffer | JimpRead | Gif, scaleInitImage: boolean, isRandom: boolean): Promise<Buffer> {
  const dir = getEffectsDir()
  const ls = await fs.readdir(dir);

  const effectGifs = ls.filter((el) => el.endsWith(".gif"));
  const randomEl = Math.floor(Math.random() * effectGifs.length);
  const randomGif = effectGifs[randomEl];
  const gifPath = path.join(dir, randomGif ?? '');

  if (!randomGif) {
    throw new Error("Missing gif")
  }

  const result = await combineRandomImages({ sourceImg, scaleInitImage, randomizePositions: isRandom, gifsToCombine: [gifPath] })

  return result
}

export async function combineWithTomato(sourceImg: Buffer | JimpRead | Gif, scaleInitImage: boolean, randomizePositions: boolean): Promise<Buffer> {
  const dir = getTomatoDir()
  const ls = await fs.readdir(dir);

  const effectGifs = ls.filter((el) => el.endsWith(".gif"));
  const randomEl = Math.floor(Math.random() * effectGifs.length);
  const randomGif = effectGifs[randomEl];
  const gifPath = path.join(dir, randomGif ?? '');

  if (!randomGif) {
    throw new Error("Missing gif")
  }
  const result = await combineRandomImages({ sourceImg, scaleInitImage, randomizePositions, gifsToCombine: [gifPath], placement: "tomato", ratio: 1.5 })

  return result
}

interface CombineOptions {
  sourceImg: Buffer | JimpRead | Gif
  scaleInitImage: boolean
  randomizePositions: boolean
  gifsToCombine: string[]
  placement?: Placement
  ratio?: number
  randomizePlacement?: boolean
}

export async function combineRandomImages(opts: CombineOptions): Promise<Buffer> {
  const { sourceImg, scaleInitImage, randomizePositions, gifsToCombine: randomGifs, ratio, randomizePlacement, placement } = opts

  const randomPlacements = new RandomPlacement();
  let targetImg: JimpRead | Gif;
  if (sourceImg instanceof Buffer) {
    // jimp had some issues with reading some png files, so using sharp for that now and slowly realizing that jimp aint it chef
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

  const firstGifLoc = randomGifs.pop();

  if (!firstGifLoc) {
    throw new Error("Couldnt get the first gif...")
  }

  const firstGif = await GifUtil.read(firstGifLoc);
  const localPlacement = placement ? placement : randomPlacements.get();

  const combiner = new GifCombiner({
    base: targetImg,
    overlay: firstGif,
    placement: localPlacement,
    randomizePositions: randomizePositions,
    randomPlacement: randomizePlacement, // needs to be ranamed
    ratio: ratio
  });

  let gif = await combiner.run();

  for (const el of randomGifs) {
    const localPlacement = placement ? placement : randomPlacements.get();
    const gifElem = await GifUtil.read(el);

    const combiner = new GifCombiner({
      base: gif,
      overlay: gifElem,
      placement: localPlacement,
      randomizePositions: randomizePositions,
      randomPlacement: randomizePlacement,
      ratio: ratio
    });

    gif = await combiner.run();
  }

  if (jimpGuardType(gif)) {
    return await gif.getBuffer("image/jpeg");
  }

  return gif.buffer;
}
