import fs from "fs/promises";
import { GifUtil } from "gifwrap";
import path from "path";
import { overlayTwoGifs } from "../lib/overlayTwoGifs";
import { overlayGif, type JimpRead } from "../lib/overlayGifImage";
import { Jimp } from "jimp";
import { RandomPlacement } from "../lib/positions";

const ASSETS_DIR = "assets/";

export async function combineRandomImages(
  sourceImg: Buffer | JimpRead,
): Promise<Buffer | null> {
  const mainPath = path.resolve(`${__dirname}/../`);
  const dir = path.join(mainPath, ASSETS_DIR);
  const ls = await fs.readdir(dir);

  const randomGifs = [] as string[];

  const randomPlacements = new RandomPlacement();

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
    targetImg = await Jimp.read(sourceImg);
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
  let gif = await overlayGif(targetImg, firstGif, placement);

  console.log("First layer constructed");

  for (const el of randomGifs) {
    console.log("Parsing random gifs");
    const placement = randomPlacements.get();
    const gifElem = await GifUtil.read(el);

    gif = await overlayTwoGifs({
      gifPrimary: gif,
      gifSecondary: gifElem,
      placement: placement,
    });
  }

  return gif.buffer;
}
