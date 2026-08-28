import fs from "fs/promises";
import { fetch, sleep } from "bun";
import path from "path";
import { splitImageToGif } from "./splitImageToGif";
import type { DownloadImage, FetchResult, RunnerOpts } from "@/types/RunnerTypes";

export const GOOD_TAGS = [
  { name: "Best Rated", tagAPIName: "__all__" },
  { name: "Good morning", tagAPIName: "good morning" },
  { name: "Anime", tagAPIName: "anime" },
  { name: "Kawaii", tagAPIName: "kawaii" },
] as const;

async function downloadImage(opts: DownloadImage) {
  const { isGif, imageUrl, width, height, saveName } = opts;

  const result = await fetch(imageUrl);

  if (!result.body) {
    console.error("No resulting body, returning...");
    return;
  }

  if (isGif) {
    const bodyArr = await Array.fromAsync(result.body);
    const buffer = Buffer.concat(bodyArr);
    const res = await splitImageToGif(buffer, width, height);
    await fs.writeFile(saveName, res.buffer);
  } else {
    const bodyArr = await Array.fromAsync(result.body);
    await fs.writeFile(saveName, bodyArr);
  }
}

async function fetchGifs(url: string, saveDir: string) {
  const result = await fetch(url);
  const data = (await result.json()) as FetchResult;

  for (const img of data.stamps) {
    console.log("Downloading image", img.id, "...");
    const isGif = img.isAnimated || img.isGif;
    const joinedPath = path.join(saveDir, `${img.id}.${isGif ? "gif" : "png"}`);

    if (await fs.exists(joinedPath)) {
      console.log("Image already downloaded");
      continue;
    }

    if (!isGif) {
      console.log("Not a gif, skipping");
      continue;
    }

    await downloadImage({
      name: img.id,
      isGif: isGif,
      imageUrl: img.srcNormal,
      saveName: joinedPath,
      width: Number(img.width),
      height: Number(img.height),
    });
    const sleepTime = Math.floor(Math.random() * 10_000);
    await sleep(sleepTime);
  }
}

export async function runGifsFetch(opts: RunnerOpts) {
  const { start, end, tag, saveDir, onEnd, onProgress } = opts;

  const exists = await fs.exists(saveDir);
  if (!exists) {
    await fs.mkdir(saveDir);
  }

  for (let i = start; i < end; i++) {
    const iter = 18 * i; // hardcoded to be 18 per page iirc
    const url = `https://www.picmix.com/maker/get-stamps?tag=${tag}&offset=${iter}`; // shamelessly stealing cool gifs from picmix
    // console.log("Generating url, with iteration ", i, " Total: ", iter);

    await fetchGifs(url, saveDir);
    const sleepTime = Math.floor(Math.random() * 1000);
    await sleep(sleepTime);

    if (onProgress) {
      onProgress(i);
    }
  }

  if (onEnd) {
    onEnd();
  }
}

// runRunner(opts);
