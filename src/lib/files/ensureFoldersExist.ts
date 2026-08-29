import { existsSync } from "fs";
import { mkdir, rename } from "node:fs/promises";
import path from "path";
import {
  getAssetsDir,
  getAssetTagDir,
  getMarkovPath,
  getMessagesPath,
  getStorageLocation,
  getTransformedLocation,
} from "./useLocation";
import { GOOD_TAGS } from "scripts/fetchGifs";

async function ensureUserFolderExists(location: string): Promise<void> {
  if (existsSync(location)) return;
  try {
    await mkdir(location);
  } catch (e) {
    console.error(e);
    throw new Error(`Couldn't make a directory ${location}`);
  }
}

async function moveLegacyFolder(location: string, destination: string): Promise<void> {
  if (!existsSync(location) || existsSync(destination)) return;

  await rename(location, destination);
}

/**
 * Making sure that storage folders exists.
 * These are used for storing user data, markov chains etc.
 */
export async function ensureUploadFoldersExist(): Promise<void> {
  const storageLocation = getStorageLocation();
  const assetsDirLocation = getAssetsDir();
  const transformedLoc = getTransformedLocation();
  const messages = getMessagesPath();
  const markovPath = getMarkovPath();

  await ensureUserFolderExists(storageLocation);

  await ensureUserFolderExists(transformedLoc);
  await ensureUserFolderExists(assetsDirLocation);

  await moveLegacyFolder(path.join(assetsDirLocation, "messages"), messages);
  await moveLegacyFolder(path.join(assetsDirLocation, "markov"), markovPath);

  await ensureUserFolderExists(messages);
  await ensureUserFolderExists(markovPath);

  for (const el of GOOD_TAGS) {
    const dir = getAssetTagDir(el);
    await ensureUserFolderExists(dir);
  }
}
