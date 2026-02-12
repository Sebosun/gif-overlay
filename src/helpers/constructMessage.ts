import type { Message } from "discord.js"
import type { ParsedSavedMessage } from "types/Messages"

export function constructMessage(msg: Message<boolean>): ParsedSavedMessage {
  return {
    author: msg.author.id,
    content: msg.content,
    id: msg.id,
    timeStamp: `${msg.createdAt.getTime()}`
  } as ParsedSavedMessage
}
