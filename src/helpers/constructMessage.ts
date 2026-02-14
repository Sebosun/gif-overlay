import type { ParsedSavedMessage } from "@/types/Messages"
import type { Message } from "discord.js"

export function constructMessage(msg: Message<boolean>): ParsedSavedMessage {
  return {
    author: msg.author.id,
    content: msg.content,
    id: msg.id,
    timeStamp: `${msg.createdAt.getTime()}`
  } as ParsedSavedMessage
}
