import { WriteStream } from "fs";
import fs from "fs/promises";
import { splitImageToGif } from "../convert";
import { sleep } from "bun";
// https://www.picmix.com/maker/get-stamps?tag=gif&offset=18
//
//
interface FetchResult {
  total: string;
  stamps: Stamps[];
}

interface Stamps {
  id: string;
  name: string;
  srcThumb: string;
  srcNormal: string;
  isAnimated: boolean;
  isGif: boolean;
  isSprite: boolean;
  frameTimes: string[];
  width: string;
  height: string;
}

interface DownloadImage {
  name: string;
  isGif: boolean;
  imageUrl: string;
  width: number;
  height: number;
}

async function downloadImage(opts: DownloadImage) {
  const { name, isGif, imageUrl, width, height } = opts;
  const result = await fetch(imageUrl);
  if (!result.body) {
  }

  if (!result.body) return;
  if (isGif) {
    console.log("Sending an image to conver");
    const bodyArr = await Array.fromAsync(result.body);
    const buffer = Buffer.concat(bodyArr);
    const res = await splitImageToGif(buffer, width, height);
    fs.writeFile(`./good-morning/${name}.gif`, res.buffer);
  } else {
    fs.writeFile(`./good-morning/${name}.png`, result.body);
  }
}

async function fetchGifs(url: string) {
  const result = await fetch(url);
  const data = (await result.json()) as FetchResult;

  for (const img of data.stamps) {
    console.log("Downloading image", img.id, "...");
    await downloadImage({
      name: img.id,
      isGif: img.isAnimated || img.isGif,
      imageUrl: img.srcNormal,
      width: Number(img.width),
      height: Number(img.height),
    });
    const sleepTime = Math.floor(Math.random() * 1000);
    await sleep(sleepTime);
  }
}

const runRunner = async (iterStart: number, iterEnd: number) => {
  for (let i = iterStart; i < iterEnd; i++) {
    const iter = 18 * i;
    const url = `https://www.picmix.com/maker/get-stamps?tag=good morning&offset=${iter}`;
    console.log("Generating url, with iteration ", i, " Total: ", iter);
    await fetchGifs(url);
    const sleepTime = Math.floor(Math.random() * 10000);
    await sleep(sleepTime);
  }
};

runRunner(3, 10);
