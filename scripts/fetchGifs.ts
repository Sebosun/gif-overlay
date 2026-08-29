import fs from "fs/promises";
import { sleep } from "bun";
import path from "path";
import { splitImageToGif } from "./splitImageToGif";
import { FetchProgressTracker } from "./fetchProgressTracker";
import type { DownloadImage, FetchResult, RunnerOpts } from "@/types/RunnerTypes";

export const GOOD_TAGS = [
  { name: "Best Rated", tagAPIName: "__all__", folderName: "best" },
  { name: "Good morning", tagAPIName: "good morning", folderName: "good_morning" },
  { name: "Anime", tagAPIName: "anime", folderName: "anime" },
  { name: "Kawaii", tagAPIName: "kawaii", folderName: "kawaii" },
] as const;

export const STAMPS_PER_PAGE = 18;

async function downloadImage(opts: DownloadImage) {
  const { imageUrl, width, height, saveName } = opts;

  const result = await fetch(imageUrl);

  if (!result.ok || !result.body) {
    throw new Error(`Unable to download image: ${result.status}`);
  }

  const bodyArr = await Array.fromAsync(result.body);
  const buffer = Buffer.concat(bodyArr);
  const res = await splitImageToGif(buffer, width, height);
  await fs.writeFile(saveName, res.buffer);
}

async function sleepUnlessStopped(milliseconds: number, shouldStop: RunnerOpts["shouldStop"]) {
  const interval = 100;
  let remaining = milliseconds;

  while (remaining > 0 && !shouldStop?.()) {
    const duration = Math.min(interval, remaining);
    await sleep(duration);
    remaining -= duration;
  }

  return !shouldStop?.();
}

async function fetchGifs(
  url: string,
  saveDir: string,
  progress: FetchProgressTracker,
  shouldStop: RunnerOpts["shouldStop"],
): Promise<boolean> {
  if (shouldStop?.()) {
    return false;
  }

  let data: FetchResult;

  try {
    const result = await fetch(url);
    if (!result.ok) {
      throw new Error(`Unable to fetch image list: ${result.status}`);
    }
    data = (await result.json()) as FetchResult;
  } catch {
    progress.error();
    return true;
  }

  for (const img of data.stamps) {
    if (shouldStop?.()) {
      return false;
    }

    const isGif = img.isAnimated || img.isGif;
    if (!isGif) {
      continue;
    }

    const joinedPath = path.join(saveDir, `${img.id}.gif`);

    if (await fs.exists(joinedPath)) {
      progress.alreadyExists();
      continue;
    }

    try {
      await downloadImage({
        name: img.id,
        imageUrl: img.srcNormal,
        saveName: joinedPath,
        width: Number(img.width),
        height: Number(img.height),
      });
      progress.downloaded();
    } catch {
      progress.error();
      continue;
    }

    const sleepTime = Math.floor(Math.random() * 10_000);
    if (!await sleepUnlessStopped(sleepTime, shouldStop)) {
      return false;
    }
  }

  return true;
}

export async function runGifsFetch(opts: RunnerOpts) {
  const { start, end, tag, saveDir, onEnd, onProgress, shouldStop } = opts;

  const exists = await fs.exists(saveDir);
  if (!exists) {
    await fs.mkdir(saveDir);
  }

  const progress = new FetchProgressTracker(onProgress);

  for (let i = start; i < end; i++) {
    if (shouldStop?.()) {
      break;
    }

    const iter = STAMPS_PER_PAGE * i;
    const url = `https://www.picmix.com/maker/get-stamps?tag=${tag}&offset=${iter}`; // shamelessly stealing cool gifs from picmix
    const completed = await fetchGifs(url, saveDir, progress, shouldStop);

    if (!completed || shouldStop?.()) {
      break;
    }

    const sleepTime = Math.floor(Math.random() * 1000);
    if (!await sleepUnlessStopped(sleepTime, shouldStop)) {
      break;
    }
  }

  onEnd?.();
}

// runRunner(opts);
