import type { Message, OmitPartialGroupDMChannel } from "discord.js"
import { getUrl } from "../util/getUrl"
import fs from 'fs/promises'
import { Gif, GifUtil } from "gifwrap"
import { mp4ToGif } from "./mp4ToGif"

const EXTRACT_GIF_ERRORS = {
  noURL: "Couldn't find url",
  missingName: "File is missing basename",
  fetchError: "Error fecthing the url"
} as const

export async function extractGif(message: OmitPartialGroupDMChannel<Message<boolean>>): Promise<Buffer | Gif> {
  let buffer: Buffer | Gif
  const url = await getUrl(message)
  const urlOBJ = new URL(url)

  if (!url) {
    throw new Error(EXTRACT_GIF_ERRORS.noURL)
  }

  const baseName = urlOBJ.pathname.split('/').at(-1)
  if (!baseName) {
    throw new Error(EXTRACT_GIF_ERRORS.missingName)
  }

  if (baseName.endsWith('mp4')) {
    const resultName = baseName + ".mp4"
    buffer = await mp4ToGif(url, resultName)
  } else {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(EXTRACT_GIF_ERRORS.fetchError)
    }

    const localBuffer = Buffer.from(await response.arrayBuffer());

    if (baseName.endsWith('.gif')) {
      const resultName = baseName + ".gif"
      await fs.writeFile(resultName, localBuffer)
      buffer = await GifUtil.read(resultName)
    } else {
      buffer = localBuffer
    }

  }

  return buffer
}
