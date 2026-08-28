import { existsSync } from "fs";
import { mkdir } from "node:fs/promises";
import { getStorageLocation, getTransformedLocation } from "./useLocation"

async function ensureUserFolderExists(location: string): Promise<void> {
  if (existsSync(location)) return
  try {
    await mkdir(location)
  } catch (e) {
    console.error(e)
    throw new Error(`Couldn't make a directory ${location}`)
  }
}

/**
 * Making sure that storage folders exists.
 * These are used for storing user data, markov chains etc.
 */
export async function ensureUploadFoldersExist(): Promise<void> {
  const imageUploadLocation = getStorageLocation()
  const transformedLoc = getTransformedLocation()
  await ensureUserFolderExists(imageUploadLocation)
  await ensureUserFolderExists(transformedLoc)
}

