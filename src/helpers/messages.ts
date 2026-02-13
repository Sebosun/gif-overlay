import path from "path"
import type { ParsedSavedMessage } from "types/Messages";
import fs from "fs/promises"

export interface MessageFile {
  id: string
  path: string
}

export const getChannelPath = (channelId: string) => {
  const projectRoot = process.cwd();
  return path.join(projectRoot, "assets", "messages", channelId + ".json")
}

export async function getMessagesFilePaths(): Promise<MessageFile[]> {
  const projectRoot = process.cwd();
  const messagesPath = path.join(projectRoot, "assets", "messages")

  // Todo try catch
  const messageFiles = await fs.readdir(messagesPath)
  const jsonFiles = messageFiles.filter(el => el.endsWith('.json'))
  const channelFiles = jsonFiles.map(el => {
    const filePath = path.join(messagesPath, el)
    const id = el.split('.').at(0) ?? ""
    return {
      id: id,
      path: filePath
    }
  })

  return channelFiles
}

export async function isChannelSaved(channelId: string): Promise<boolean> {
  const savePath = getChannelPath(channelId)
  try {
    return await fs.exists(savePath)
  } catch {
    return false
  }
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
