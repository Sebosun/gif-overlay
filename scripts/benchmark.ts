import fs from "fs/promises";
import { GifUtil } from "gifwrap";
import path from "path";
import { GifCombiner, jimpGuardType } from "../lib/overlayTwoGifs";
import { type JimpRead } from "../lib/overlayGifImage";
import { Jimp } from "jimp";
import { RandomPlacement } from "../lib/positions";

const ASSETS_DIR = "benchmark-assets/";
const baseImage = "image.jpg";
const goodMorning = "good-morning.gif";
const heart = "heart.gif";
const random = "random.gif";

// I need predictable results to see what works and what doesnt work
export async function combineRandomImages(): Promise<Buffer | null> {
  const baseImagePath = path.join(ASSETS_DIR, baseImage);
  const goodMorningPath = path.join(ASSETS_DIR, goodMorning);
  const heartPath = path.join(ASSETS_DIR, heart);
  const randomPath = path.join(ASSETS_DIR, random);

  const targetImg = await Jimp.read(baseImagePath);
  const goodMorningGif = await GifUtil.read(goodMorningPath);
  const heartGif = await GifUtil.read(heartPath);
  const randomGif = await GifUtil.read(randomPath);

  const combiner = new GifCombiner({
    gifPrimary: targetImg,
    gifSecondary: goodMorningGif,
    placement: "bottom-right",
  });

  let gif = await combiner.run();

  const combinerHeart = new GifCombiner({
    gifPrimary: gif,
    gifSecondary: heartGif,
    placement: "bottom-left",
  });

  gif = await combinerHeart.run();

  const combinerRandom = new GifCombiner({
    gifPrimary: gif,
    gifSecondary: randomGif,
    placement: "top-right",
  });

  gif = await combinerRandom.run();

  if (jimpGuardType(gif)) {
    return await gif.getBuffer("image/jpeg");
  }

  return gif.buffer;
}

const result = await combineRandomImages();
if (!result) {
  throw new Error("Error parsing");
}

const savePath = path.join(ASSETS_DIR, `result.gif`);
await fs.writeFile(savePath, result);
