import path from "path"
import type { ParsedSavedMessage } from "types/Messages";
import fs from "fs/promises"
import type { FlatPromise } from "types/Common";

export interface MessageFile {
  id: string
  path: string
}

export const getChannelPath = (channelId: string) => {
  const projectRoot = process.cwd();
  return path.join(projectRoot, "assets", "messages", channelId + ".json")
}

export async function getMessagesFilePaths(): FlatPromise<MessageFile[]> {
  const projectRoot = process.cwd();
  const messagesPath = path.join(projectRoot, "assets", "messages")

  try {
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

    return [undefined, channelFiles]
  } catch (e) {
    if (e instanceof Error) {
      return [e, undefined]
    }
    return [new Error("Unknown catch reading files"), undefined]
  }
}

export async function isChannelSaved(channelId: string): Promise<boolean> {
  const savePath = getChannelPath(channelId)
  try {
    return await fs.exists(savePath)
  } catch {
    return false
  }
}

export async function getSavedMessages(channelId: string): FlatPromise<ParsedSavedMessage[]> {
  const savePath = getChannelPath(channelId)

  try {
    const exists = await fs.exists(savePath)
    if (!exists) {
      return [undefined, []]
    }

    const res = await fs.readFile(savePath, 'utf8')
    const messages = JSON.parse(res) as ParsedSavedMessage[]
    return [undefined, messages]
  } catch (e) {
    console.error("Path might not exist", e)
    return [undefined, []]
  }
}
