import path from "path";
import sharp from "sharp";
import { tomatoArgs } from "./builder";
import { getTomatoPath, getTransformedLocation } from "@/lib/files/useLocation";
import { execWithTimeout } from "@/util/execWithTimeout";

async function readWidth(imagePath: string): Promise<number | undefined> {
  try {
    const { width } = await sharp(imagePath).metadata();
    return width;
  } catch {
    return undefined;
  }
}

/**
 * Overlays the tomato GIF onto an input image and writes a downscaled GIF in a single ffmpeg pass.
 *
 * @param inputImagePath - Path to the source image.
 * @param amount - Number of tomato overlays to apply.
 * @returns Path to the resulting GIF.
 */
export async function ffmpegCombineTomato(
  inputImagePath: string,
  amount: number = 1,
): Promise<string> {
  const fileName = inputImagePath.split("/").pop()?.split(".")[0];
  if (!fileName) {
    console.error("No extension", fileName);
    throw new Error("You failed");
  }

  const resultPath = path.join(getTransformedLocation(), `${fileName}--result.gif`);

  const args = tomatoArgs({
    background: inputImagePath,
    overlay: getTomatoPath(),
    resultPath,
    amount,
    backgroundWidth: await readWidth(inputImagePath),
  });

  await execWithTimeout("ffmpeg", args);
  return resultPath;
}
