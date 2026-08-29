import { ensureUploadFoldersExist } from "@/lib/files/ensureFoldersExist";
import { getAssetsDir, getMarkovPath, getMessagesPath, getTomatoPath, getTransformedLocation } from "@/lib/files/useLocation";
import { cleanupFiles } from "@/lib/files/cleanupFiles";
import type { FlatPromise } from "@/types/Common";
import fs from "fs/promises";
import path from "path";

const tomatoSourcePath = path.resolve(import.meta.dir, "../../../TOMATO_rename_to_gif");

async function clearFolderContents(dir: string, fallbackError: string): FlatPromise {
  try {
    const ls = await fs.readdir(dir);
    for (const element of ls) {
      await cleanupFiles(path.join(dir, element));
    }

    return [undefined, undefined];
  } catch (e) {
    if (e instanceof Error) {
      return [e, undefined];
    }
    return [new Error(fallbackError), undefined];
  }
}

export async function cleanTransformedImages(): FlatPromise {
  return clearFolderContents(getTransformedLocation(), "Couldn't remove transformed images");
}

export async function cleanAssets(): FlatPromise {
  const [error] = await clearFolderContents(getAssetsDir(), "Couldn't remove assets");
  if (error) {
    return [error, undefined];
  }

  try {
    await ensureUploadFoldersExist();
    return [undefined, undefined];
  } catch (e) {
    if (e instanceof Error) {
      return [e, undefined];
    }
    return [new Error("Couldn't recreate asset folders"), undefined];
  }
}

export async function clearSavedMarkovData(): FlatPromise {
  const [messagesError] = await clearFolderContents(getMessagesPath(), "Couldn't remove saved messages");
  if (messagesError) {
    return [messagesError, undefined];
  }

  return clearFolderContents(getMarkovPath(), "Couldn't remove Markov chains");
}

export async function createTomatoGif(): FlatPromise {
  try {
    await ensureUploadFoldersExist();
    await fs.copyFile(tomatoSourcePath, getTomatoPath());
    return [undefined, undefined];
  } catch (e) {
    if (e instanceof Error) {
      return [e, undefined];
    }
    return [new Error("Couldn't create tomato GIF"), undefined];
  }
}

export async function tomatoGifExists(): Promise<boolean> {
  return fs.exists(getTomatoPath());
}
