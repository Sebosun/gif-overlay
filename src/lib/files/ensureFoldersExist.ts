import { existsSync } from "fs";
import { mkdir } from "node:fs/promises";
import {
  getAssetsDir,
  getAssetTagDir,
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

/**
 * Making sure that storage folders exists.
 * These are used for storing user data, markov chains etc.
 */
export async function ensureUploadFoldersExist(): Promise<void> {
  const storageLocation = getStorageLocation();
  const assetsDirLocation = getAssetsDir();
  const transformedLoc = getTransformedLocation();
  const messages = getMessagesPath();

  await ensureUserFolderExists(storageLocation);

  await ensureUserFolderExists(transformedLoc);
  await ensureUserFolderExists(assetsDirLocation);
  await ensureUserFolderExists(messages);

  for (const el of GOOD_TAGS) {
    const dir = getAssetTagDir(el);
    await ensureUserFolderExists(dir);
  }
}
