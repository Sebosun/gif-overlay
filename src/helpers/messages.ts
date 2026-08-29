import path from "path"
import fs from "fs/promises"
import type { FlatPromise } from "@/types/Common"
import type { ParsedSavedMessage } from "@/types/Messages"
import { getAssetsDir, getMessagesPath } from "@/lib/files/useLocation"

export interface MessageFile {
  id: string
  path: string
}

/**
 * Builds the path for a channel's persisted message history JSON file.
 */
export const getChannelPath = (channelId: string) => {
  return path.join(getAssetsDir(), "messages", channelId + ".json")
}

/**
 * Lists persisted channel message files as channel IDs and absolute paths.
 *
 * @returns A flat result containing matching JSON files or the directory-read error.
 */
export async function getMessagesFilePaths(): FlatPromise<MessageFile[]> {
  const messagesPath = getMessagesPath()

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

/**
 * Checks whether a channel has a persisted message history file.
 */
export async function isChannelSaved(channelId: string): Promise<boolean> {
  const savePath = getChannelPath(channelId)
  try {
    return await fs.exists(savePath)
  } catch {
    return false
  }
}

/**
 * Reads a channel's persisted messages.
 *
 * @returns A flat result containing messages; missing or unreadable files return an empty list.
 */
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
