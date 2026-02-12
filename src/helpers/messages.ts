import path from "path"
import type { ParsedSavedMessage } from "types/Messages";
import fs from "fs/promises"

export const getChannelPath = (channelId: string) => {
  const projectRoot = process.cwd();
  return path.join(projectRoot, "assets", "messages", channelId + ".json")
}

export async function getSavedMessages(channelId: string): Promise<[boolean, ParsedSavedMessage[]]> {
  const savePath = getChannelPath(channelId)

  try {
    const exists = await fs.exists(savePath)
    if (!exists) {
      return [false, []]
    }

    const res = await fs.readFile(savePath, 'utf8')
    const messages = JSON.parse(res) as ParsedSavedMessage[]
    return [true, messages]
  } catch (e) {
    console.error("Path might not exist", e)
    return [false, []]
  }
}
