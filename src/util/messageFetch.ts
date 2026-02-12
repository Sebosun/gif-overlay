import { ChannelType, type Client, type FetchMessagesOptions } from "discord.js";
import fs from "fs/promises"
import type pino from "pino";
import { constructMessage } from "../helpers/constructMessage";
import type { ParsedSavedMessage } from "types/Messages";
import { getChannelPath } from "@/helpers/messages";

const MAX_MESSAGES = 100
const LIMIT_PER_REQUEST = 100



export async function messageFetch(client: Client<boolean>, channelId: string, logger?: pino.Logger): Promise<ParsedSavedMessage[]> {
  let allMessages = [] as ParsedSavedMessage[];
  let lastMessageId: string | undefined;

  const channel = await client.channels.fetch(channelId)

  if (!channel || channel.type !== ChannelType.GuildText) {
    throw new Error("Channel does not exist or is not a text channel")
  }

  while (allMessages.length < MAX_MESSAGES) {
    const options: FetchMessagesOptions = { limit: LIMIT_PER_REQUEST };
    if (lastMessageId) {
      options.before = lastMessageId;
    }

    const messages = await channel.messages.fetch(options);

    logger?.info({ curLen: allMessages.length, lastId: options.before }, "Fetched messages")

    if (messages.size === 0) break;

    const messagesWithoutBot = messages.filter(el => el.author.id !== client.user?.id)
    const messagesNew = messagesWithoutBot.map(constructMessage)

    allMessages = [...allMessages, ...messagesNew]
    lastMessageId = messages.last()?.id;

    if (messages.size < 100) break; // Reached end of available messages
  }

  const savePath = getChannelPath(channelId)
  await fs.writeFile(savePath, JSON.stringify(allMessages))

  return allMessages
}
