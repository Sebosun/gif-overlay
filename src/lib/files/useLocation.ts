import path from "path";
import { homedir } from "os";
import type { GOOD_TAGS } from "scripts/fetchGifs";

const home = homedir();

// TODO: customizing the path
const FOLDER_NAME = "gif-overlay";

// Hoonestly, this is not ideal
// It could just sit in memory and we would just export the return values
// - why call it each time? But it works so w/e for now

export function getStorageLocation(): string {
  return path.join(home, ".local", "share", FOLDER_NAME);
}

export function getAssetsDir(): string {
  return path.join(getStorageLocation(), "assets");
}

export function getMessagesPath(): string {
  return path.join(getStorageLocation(), "messages");
}

// transformed images loc
export function getTransformedLocation(): string {
  return path.join(getStorageLocation(), "transformed");
}

export function getRootDir(): string {
  return path.resolve(`${__dirname}/../../`);
}

export function getRandomDir(): string {
  const RANDOM_DIR = "random";
  const dir = path.join(getAssetsDir(), RANDOM_DIR);
  return dir;
}

export function getEffectsDir(): string {
  const EFFECTS_DIR = "effects";
  const dir = path.join(getStorageLocation(), EFFECTS_DIR);
  return dir;
}

export function getTomatoDir(): string {
  const TOMATO_DIR = "tomato";
  const dir = path.join(getStorageLocation(), TOMATO_DIR);
  return dir;
}

export function getAssetTagDir(asset: typeof GOOD_TAGS[number]): string {
  const dir = path.join(getStorageLocation(), `assets/${asset.folderName}`);
  return dir;
}

export function getMarkovPath() {
  return path.join(getStorageLocation(), "markov");
}
