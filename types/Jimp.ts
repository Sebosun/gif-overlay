import { type Jimp } from "jimp"

export type JimpRead = Awaited<ReturnType<typeof Jimp.read>>
