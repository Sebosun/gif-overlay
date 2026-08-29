import { beforeAll, describe, expect, test } from "vitest";
import fs from "fs/promises";
import { homedir } from "os";
import path from "path";
import { ensureUploadFoldersExist } from "../src/lib/files/ensureFoldersExist";
import {
  getAssetTagDir,
  getEffectsDir,
  getRandomDir,
  getRootDir,
  getStorageLocation,
  getTomatoDir,
  getTransformedLocation,
} from "../src/lib/files/useLocation";

describe("storage locations", () => {
  beforeAll(async () => {
    await ensureUploadFoldersExist();
  });

  test("returns the user storage directory", async () => {
    const location = getStorageLocation();

    expect(location).toBe(path.join(homedir(), ".local", "share", "gif-overlay"));
    await expect(fs.stat(location)).resolves.toBeDefined();
  });

  test("returns the transformed directory", async () => {
    const location = getTransformedLocation();

    expect(location).toBe(path.join(getStorageLocation(), "transformed"));
    await expect(fs.stat(location)).resolves.toBeDefined();
  });

  test("returns the project root directory", async () => {
    await expect(fs.stat(getRootDir())).resolves.toBeDefined();
  });

  test("returns the randomizer asset directory", () => {
    expect(getRandomDir()).toBe(path.join(getStorageLocation(), "assets", "randomizer"));
  });

  test("returns the effects asset directory", () => {
    expect(getEffectsDir()).toBe(path.join(getStorageLocation(), "assets", "effects"));
  });

  test("returns the tomato asset directory", () => {
    expect(getTomatoDir()).toBe(path.join(getStorageLocation(), "assets", "tomato"));
  });

  test("returns a tag-specific asset directory", () => {
    expect(getAssetTagDir({ name: "Anime", tagAPIName: "anime", folderName: "anime" })).toBe(
      path.join(getStorageLocation(), "assets", "anime"),
    );
  });
});
