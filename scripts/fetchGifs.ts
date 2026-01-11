import fs from "fs/promises";
import { splitImageToGif } from "../convert";
import { fetch, sleep } from "bun";
import path from "path";
import type {
  DownloadImage,
  FetchResult,
  RunnerOpts,
} from "../types/RunnerTypes";

async function downloadImage(opts: DownloadImage, saveDir: string) {
  const { name, isGif, imageUrl, width, height } = opts;

  const result = await fetch(imageUrl);

  const joinedPath = path.join(saveDir, `${name}.${isGif ? "gif" : "png"}`);

  if (await fs.exists(joinedPath)) {
    console.log("Image already exists, skipping...");
    return;
  }

  if (!result.body) {
    console.error("No resulting body, returning...");
    return;
  }

  if (isGif) {
    console.log("Sending an image to conver");
    console.log("Array form async exists", Boolean(Array.fromAsync));
    const bodyArr = await Array.fromAsync(result.body);
    const buffer = Buffer.concat(bodyArr);
    const res = await splitImageToGif(buffer, width, height);
    await fs.writeFile(joinedPath, res.buffer);
  } else {
    const bodyArr = await Array.fromAsync(result.body);
    await fs.writeFile(joinedPath, bodyArr);
  }
}

async function fetchGifs(url: string, saveDir: string) {
  const result = await fetch(url);
  const data = (await result.json()) as FetchResult;

  for (const img of data.stamps) {
    console.log("Downloading image", img.id, "...");
    await downloadImage(
      {
        name: img.id,
        isGif: img.isAnimated || img.isGif,
        imageUrl: img.srcNormal,
        width: Number(img.width),
        height: Number(img.height),
      },
      saveDir,
    );
    const sleepTime = Math.floor(Math.random() * 1000);
    await sleep(sleepTime);
  }
}

async function runRunner(opts: RunnerOpts) {
  const { start, end, tag, saveDir } = opts;

  const exists = await fs.exists(saveDir);
  if (!exists) {
    await fs.mkdir(saveDir);
  }

  for (let i = start; i < end; i++) {
    const iter = 18 * i;
    const url = `https://www.picmix.com/maker/get-stamps?tag=${tag}&offset=${iter}`; // shamelessly stealing cool gifs from picmix
    console.log("Generating url, with iteration ", i, " Total: ", iter);

    await fetchGifs(url, saveDir);
    const sleepTime = Math.floor(Math.random() * 10000);
    await sleep(sleepTime);
  }
}

const GOOD_TAGS = {
  best_rated: "__all__",
  morning: "good morning",
  anime: "anime",
  kawaii: "kawaii",
} as const;

const opts = {
  saveDir: "../assets/random/",
  start: 1,
  end: 10,
  tag: GOOD_TAGS.best_rated,
};

runRunner(opts);
