import { randomNumberInterval } from "lib/randomNumberInterval"

interface CommandBuilder {
  background: string, overlay: string, resultPath: string, amount: number
}

export function getCentering() {
  let center = ``
  const randomX = randomNumberInterval(-200, 200)
  const randomY = randomNumberInterval(-50, 600)
  // const center = `x=(W-w)-${randomX}/2:y=(H-h)-${randomY}/2`

  if (randomX >= 0) {
    center += `x=((W-w)-${Math.abs(randomX)})/2`
  } else {
    center += `x=((W-w)+${Math.abs(randomX)})/2`
  }

  center += ":"

  if (randomY >= 0) {
    center += `y=(H-h)-${Math.abs(randomY)}/2`
  } else {
    center += `y=(H-h)+${Math.abs(randomY)}/2`
  }

  return center
}

export function commandBuilder(options: CommandBuilder) {
  const { background: bg, overlay: ov, resultPath, amount } = options

  const collector = ['ffmpeg']

  const setupRef = "[0:v]split=2[bg][ref]"
  const inputs = [`-i ${bg}`]
  const scale = [] as string[]
  const overlay = [] as string[]
  // let overlay = `[0:v][scaled]overlay=${center}:shortest=1`
  // const filter = `-filter_complex "${scale};${overlay}[firstpass];[firstpass][2:v]overlay=${center2}:shortest=1"`
  // let scale = "[1:v]scale=w=oh*dar:h=rh[scaled]"

  for (let i = 0; i < amount; i++) {
    const scaleName = `scaled${i + 1}`
    const pass = `pass${i + 1}`
    const pvPass = `pass${i}`
    const center = getCentering()

    inputs.push(`-i ${ov}`)

    // Rant but apparently when you provide [0][ref] to scale, it takes the second 
    // input as reference, not a thing you apply on
    // Imagine spending like 2 hours finding out why
    // dar = display ratio (selected gif); oh = output height; rh = reference height
    scale.push(`[${i + 1}:v][ref]scale=w=oh*dar:h=rh[${scaleName}]`)

    // last arg of overlay cannot assign a name
    if (amount === 1) {
      overlay.push(`[bg][${scaleName}]overlay=${center}:shortest=1`)
    } else if (i === 0) {
      overlay.push(`[bg][${scaleName}]overlay=${center}:shortest=1[${pass}]`)
    } else if (i + 1 === amount) {
      overlay.push(`[${pvPass}][${scaleName}]overlay=${center}:shortest=1`)
    } else {
      overlay.push(`[${pvPass}][${scaleName}]overlay=${center}:shortest=1[${pass}]`)
    }
  }

  const filterJoined = `-filter_complex "${setupRef};${scale.join(";")};${overlay.join(";")}"`

  const confirmReplace = "-y"

  if (!bg.endsWith('.gif')) {
    const loop = "-loop 1"
    collector.push(loop)
  }

  collector.push(inputs.join(" "))
  collector.push(filterJoined)
  collector.push(confirmReplace)
  collector.push(resultPath)

  return collector.join(" ")
}

export const optimizeCommand = (input: string, output: string) => {
  return `ffmpeg -y -i ${input} -vf "scale=300:-1:flags=lanczos,fps=10" -loop 0 ${output}`
}
