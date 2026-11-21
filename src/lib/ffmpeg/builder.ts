import { randomNumberInterval } from "@/lib/randomNumberInterval"
import { config } from "@/config"

interface TomatoArgsOptions {
  background: string
  overlay: string
  resultPath: string
  amount: number
  /** Width of the source background, used to keep random offsets proportional after downscaling. */
  backgroundWidth?: number
}

/**
 * Builds an overlay position expression for one tomato.
 *
 * Random offsets are configured in source-image pixels, so they are scaled by
 * `scaleFactor` to match the downscaled frame the overlay is applied to.
 */
export function getCentering(scaleFactor = 1): string {
  const randomX = randomNumberInterval(config.ffmpegCenterRandomXMin, config.ffmpegCenterRandomXMax)
  const randomY = randomNumberInterval(config.ffmpegCenterRandomYMin, config.ffmpegCenterRandomYMax)

  const dx = Math.round((-randomX * scaleFactor) / 2)
  const dy = Math.round((-randomY * scaleFactor) / 2)

  return `x=(W-w)/2+(${dx}):y=(H-h)+(${dy})`
}

/**
 * Builds ffmpeg arguments that overlay `amount` tomatoes on a background in a single pass.
 *
 * The background is downscaled to the output width and the frame rate is reduced
 * before any compositing, the tomato GIF is decoded and scaled once and then split,
 * and a generated palette is used for the final GIF encode.
 */
export function tomatoArgs(options: TomatoArgsOptions): string[] {
  const { background, overlay, resultPath, amount, backgroundWidth } = options

  const width = config.ffmpegOptimizeScaleWidth
  const fps = config.ffmpegOptimizeFps
  const scaleFactor = backgroundWidth ? width / backgroundWidth : 1
  const isAnimated = background.endsWith(".gif")

  // Still images are decoded and scaled once, then repeated with the loop filter
  // instead of re-decoding the full-size source for every frame.
  const bgChain = isAnimated
    ? `[0:v]fps=${fps},scale=${width}:-1:flags=lanczos`
    : `[0:v]scale=${width}:-1:flags=lanczos,loop=loop=-1:size=1,fps=${fps}`

  const filters = [
    `${bgChain},split=2[bg][ref]`,
    // dar = display ratio (selected gif); oh = output height; rh = reference height
    `[1:v]fps=${fps}[tomato]`,
    `[tomato][ref]scale=w=oh*dar:h=rh[scaled]`,
  ]

  const tomatoLabels = Array.from({ length: amount }, (_, i) => `[t${i}]`)
  filters.push(`[scaled]split=${amount}${tomatoLabels.join("")}`)

  let previous = "[bg]"
  for (const [i, label] of tomatoLabels.entries()) {
    const next = `[p${i}]`
    filters.push(`${previous}${label}overlay=${getCentering(scaleFactor)}:shortest=1${next}`)
    previous = next
  }

  filters.push(`${previous}split[pa][pb]`)
  filters.push(`[pa]palettegen[pal]`)
  filters.push(`[pb][pal]paletteuse=dither=bayer`)

  return [
    "-v", "error",
    "-y",
    "-i", background,
    "-i", overlay,
    "-filter_complex", filters.join(";"),
    "-loop", String(config.ffmpegOptimizeLoopCount),
    resultPath,
  ]
}
