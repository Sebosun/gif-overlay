import fs from "fs/promises";
import { GifUtil } from "gifwrap";
import path from "path";
import { Jimp } from "jimp";
import { GifCombiner, jimpGuardType } from "../lib/GifCombiner";

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
    base: targetImg,
    overlay: goodMorningGif,
    placement: "bottom-right",
    randomizePositions: false
  });

  let gif = await combiner.run();

  const combinerHeart = new GifCombiner({
    base: gif,
    overlay: heartGif,
    placement: "bottom-left",
    randomizePositions: false
  });

  gif = await combinerHeart.run();

  const combinerRandom = new GifCombiner({
    base: gif,
    overlay: randomGif,
    placement: "top-right",
    randomizePositions: false
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
