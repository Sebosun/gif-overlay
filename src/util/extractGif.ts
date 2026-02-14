import type { Message, OmitPartialGroupDMChannel } from "discord.js"
import { getUrl } from "../util/getUrl"
import fs from 'fs/promises'
import { Gif, GifUtil } from "gifwrap"
import { mp4ToGif } from "./mp4ToGif"
import { getStorageLocation } from "@/lib/files/useLocation"
import path from "path"
import type { FlatCatch } from "@/types/Common"
import { config } from "@/config"

const EXTRACT_GIF_ERRORS = {
  noURL: "Couldn't find url",
  missingName: "File is missing basename",
  fetchError: "Error fecthing the url"
} as const

export async function extractImage(message: OmitPartialGroupDMChannel<Message<boolean>>): Promise<FlatCatch<Buffer | Gif>> {
  const url = await getUrl(message)
  const urlOBJ = new URL(url)

  const id = message.id
  if (!url) {
    return [new Error(EXTRACT_GIF_ERRORS.noURL), undefined]
  }

  const baseName = urlOBJ.pathname.split('/').at(-1)
  if (!baseName) {
    return [new Error(EXTRACT_GIF_ERRORS.missingName), undefined]
  }

  if (baseName.endsWith('mp4')) {
    const resultName = baseName + ".mp4"
    return await mp4ToGif(url, resultName)
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent': config.httpUserAgent
    }
  });

  if (!response.ok) {
    return [new Error(EXTRACT_GIF_ERRORS.fetchError), undefined]
  }

  const localBuffer = Buffer.from(await response.arrayBuffer());

  if (baseName.endsWith('.gif')) {
    const storageLoc = getStorageLocation()
    const resultName = id + ".gif"
    const filename = path.join(storageLoc, resultName)

    await fs.writeFile(filename, localBuffer)
    const gif = await GifUtil.read(filename)
    return [undefined, gif]
  }

  return [undefined, localBuffer]
}

export async function extractImagePathName(message: OmitPartialGroupDMChannel<Message<boolean>>): Promise<FlatCatch<string>> {
  const url = await getUrl(message)
  const urlOBJ = new URL(url)

  const id = message.id
  if (!url) {
    return [new Error(EXTRACT_GIF_ERRORS.noURL), undefined]
  }

  const baseName = urlOBJ.pathname.split('/').at(-1)
  if (!baseName) {
    return [new Error(EXTRACT_GIF_ERRORS.missingName), undefined]
  }

  const extension = baseName.split('.').pop()

  if (baseName.endsWith('mp4')) {
    return [new Error("other files not supported now dawg"), undefined]
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent': config.httpUserAgent
    }
  });

  if (!response.ok) {
    return [new Error(EXTRACT_GIF_ERRORS.fetchError), undefined]
  }

  const localBuffer = Buffer.from(await response.arrayBuffer());

  const storageLoc = getStorageLocation()
  const resultName = `${id}.${extension}`
  const filename = path.join(storageLoc, resultName)

  await fs.writeFile(filename, localBuffer)
  return [undefined, filename]
}
