import path from "path";
import { commandBuilder, optimizeCommand } from "./builder";
import { getTomatoPath, getTransformedLocation } from "@/lib/files/useLocation";
import { execWithTimeout } from "@/util/execWithTimeout";

/**
 * Overlays the tomato GIF onto an input image and creates optimized and unoptimized GIF outputs.
 *
 * @param inputImagePath - Path to the source image.
 * @param amount - Number of tomato overlays to apply.
 * @returns Paths to the unoptimized and optimized GIFs, respectively.
 */
export async function ffmpegCombineTomato(
  inputImagePath: string,
  amount: number = 1,
): Promise<[unopt: string, optimized: string]> {
  const tomatoPath = getTomatoPath();

  const fileName = inputImagePath.split("/").pop()?.split(".")[0];
  if (!fileName) {
    console.error("No extension", fileName);
    throw new Error("You failed");
  }

  const resultPath = path.join(getTransformedLocation(), `${fileName}.gif`);
  const optimizedPath = path.join(
    getTransformedLocation(),
    `${fileName}--result.gif`,
  );

  const command = commandBuilder({
    background: inputImagePath,
    overlay: tomatoPath,
    resultPath: resultPath,
    amount: amount,
  });

  const optCommand = optimizeCommand(resultPath, optimizedPath);

  await execWithTimeout(command)

  //This needs some timeout
  await execWithTimeout(optCommand)
  return [resultPath, optimizedPath]
}
