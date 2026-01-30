import path from "path"
import cp from "child_process"
import { getTransformedLocation } from "./useLocation"


interface CommandBuilder {
  background: string, overlay: string, resultPath: string
}

const commandBuilder = (options: CommandBuilder) => {
  const { background: bg, overlay: ov, resultPath } = options

  const scale = "[1:v]scale=w=oh*dar:h=rh[scaled]"
  const center = "x=(W-w)/2:y=(H-h)-100/2"
  const filter = `"${scale};[0:v][scaled]overlay=${center}:shortest=1"`

  const command = `ffmpeg -loop 1 -i ${bg} -i ${ov} -filter_complex ${filter} -y ${resultPath}`

  return command
}

export async function ffmpegCombineTomato(inputImagePath: string): Promise<string> {
  const projectRoot = process.cwd();

  const tomatoPath = path.join(projectRoot, "assets", "tomato", "tomato.gif")

  const fileName = inputImagePath.split('/').pop()?.split(".")[0]
  if (!fileName) {
    console.error("No extension", fileName)
    throw new Error("You failed")
  }

  const resultPath = path.join(getTransformedLocation(), `${fileName}.gif`)

  const command = commandBuilder({
    background: inputImagePath,
    overlay: tomatoPath,
    resultPath: resultPath
  })

  return new Promise((resolve, reject) => {
    cp.exec(command, (error) => {
      if (error) {
        reject(error)
      }

      resolve(resultPath)
    })
  })
}
