import path from "path";
import cp from "child_process";
import { commandBuilder, optimizeCommand } from "./builder";
import { getTransformedLocation } from "lib/files/useLocation";

export async function ffmpegCombineTomato(
  inputImagePath: string,
  amount: number = 1,
): Promise<[unopt: string, optimized: string]> {
  const projectRoot = process.cwd();

  const tomatoPath = path.join(projectRoot, "assets", "tomato", "tomato.gif");

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
  // return await new Promise((resolve, reject) => {
  //   const startTime = new Date();

  //   const proc = cp.exec(optCommand, (error) => {
  //     if (error) {
  //       reject(error);
  //     }

  //     resolve([resultPath, optimizedPath]);
  //   });
  // });
}

const execWithTimeout = (command: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    let interval: NodeJS.Timeout;
    const startTime = new Date();

    const proc = cp.exec(command, (error) => {
      if (error) {
        reject(error);
      }

      resolve();
      clearInterval(interval)
    });

    interval = setInterval(() => {
      const curTime = new Date();
      // Likely shouldn't run for more than minutes, even on raspberry pi
      if (Number(curTime) - Number(startTime) > 1000 * 60 * 5) {
        clearInterval(interval);
        if (!proc.exitCode) {
          proc.kill();
        }
        reject(new Error("Command ran for too long"));
      }
    }, 1000 * 60);
  });
};
