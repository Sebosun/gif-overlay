import path from "path";
import { homedir } from "os";

const home = homedir()

// TODO: customizing the path

const FOLDER_NAME = "gif-overlay"

// Hoonestly, this is not ideal
// It could just sit in memory and we would just export the return values 
// - why call it each time? But it works so w/e for now

export function getStorageLocation(): string {
  return path.join(home, ".local", 'share', FOLDER_NAME)
}

// transformed images loc
export function getTransformedLocation(): string {
  return path.join(getStorageLocation(), "transformed")
}

export function getRootDir(): string {
  console.log(__dirname)
  return path.resolve(`${__dirname}/../../`);
}

export function getRandomDir(): string {
  const RANDOM_DIR = "assets/randomizer";
  const dir = path.join(getRootDir(), RANDOM_DIR);
  return dir
}

export function getEffectsDir(): string {
  const EFFECTS_DIR = "assets/effects";
  const dir = path.join(getRootDir(), EFFECTS_DIR);
  return dir
}

export function getTomatoDir(): string {
  const TOMATO_DIR = "assets/tomato";
  const dir = path.join(getRootDir(), TOMATO_DIR);
  return dir
}
