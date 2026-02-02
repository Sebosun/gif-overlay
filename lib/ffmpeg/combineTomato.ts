import path from "path"
import cp from "child_process"
import { commandBuilder, optimizeCommand } from "./builder";
import { getTransformedLocation } from "lib/files/useLocation";


export async function ffmpegCombineTomato(inputImagePath: string, amount: number = 1): Promise<[unopt: string, optimized: string]> {
  const projectRoot = process.cwd();

  const tomatoPath = path.join(projectRoot, "assets", "tomato", "tomato.gif")

  const fileName = inputImagePath.split('/').pop()?.split(".")[0]
  if (!fileName) {
    console.error("No extension", fileName)
    throw new Error("You failed")
  }

  const resultPath = path.join(getTransformedLocation(), `${fileName}.gif`)
  const optimizedPath = path.join(getTransformedLocation(), `${fileName}--result.gif`)

  const command = commandBuilder({
    background: inputImagePath,
    overlay: tomatoPath,
    resultPath: resultPath,
    amount: amount
  })

  const optCommand = optimizeCommand(resultPath, optimizedPath)

  await new Promise((resolve, reject) => {
    cp.exec(command, (error) => {
      if (error) {
        reject(error)
      }
      resolve(resultPath)
    })
  })

  return await new Promise((resolve, reject) => {
    cp.exec(optCommand, (error) => {
      if (error) {
        reject(error)
      }

      resolve([resultPath, optimizedPath])
    })
  })
}
