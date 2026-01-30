import path from "path"
import cp from "child_process"
import { getTransformedLocation } from "./useLocation"
import { randomNumberInterval } from "./randomNumberInterval"


interface CommandBuilder {
  background: string, overlay: string, resultPath: string
}

const commandBuilder = (options: CommandBuilder) => {
  const { background: bg, overlay: ov, resultPath } = options


  const commandParts = ['ffmpeg']
  if (!bg.endsWith('.gif')) {
    const loop = "-loop 1"
    commandParts.push(loop)
  }

  const inputs = `-i ${bg} -i ${ov}`
  commandParts.push(inputs)
  commandParts.push("-filter_complex")

  const scale = "[1:v]scale=w=oh*dar:h=rh[scaled]"

  let center = ""
  const randomX = randomNumberInterval(-50, 50)
  const randomY = randomNumberInterval(-50, 50)

  if (randomX >= 0) {
    center += `x=(W-w)-${Math.abs(randomX)}/2`
  } else {
    center += `x=(W-w)+${Math.abs(randomX)}/2`
  }

  center += ":"

  if (randomY >= 0) {
    center += `y=(H-h)-${Math.abs(randomY)}/2`
  } else {
    center += `y=(H-H)+${Math.abs(randomY)}/2`
  }

  // const center = `x=(W-w)-${randomX}/2:y=(H-h)-${randomY}/2`
  const filter = `"${scale};[0:v][scaled]overlay=${center}:shortest=1"`

  commandParts.push(filter)

  const confirmReplace = "-y"
  commandParts.push(confirmReplace)
  commandParts.push(resultPath)

  return commandParts.join(" ")
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

  console.log("Command", command)

  return new Promise((resolve, reject) => {
    cp.exec(command, (error) => {
      if (error) {
        reject(error)
      }

      resolve(resultPath)
    })
  })
}
