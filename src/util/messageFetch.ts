import { ChannelType, type Client, type FetchMessagesOptions } from "discord.js";
import type pino from "pino";
import { constructMessage } from "../helpers/constructMessage";
import type { ParsedSavedMessage } from "types/Messages";
import type { FlatCatch } from "types/Common";

const MAX_MESSAGES = 100
const LIMIT_PER_REQUEST = 100

export async function fetchChannelMessages(client: Client<boolean>, channelId: string, logger?: pino.Logger): Promise<FlatCatch<ParsedSavedMessage[]>> {
  let allMessages = [] as ParsedSavedMessage[];
  let lastMessageId: string | undefined;

  const channel = await client.channels.fetch(channelId)

  if (!channel || channel.type !== ChannelType.GuildText) {
    logger?.error({ channelId }, "Channel does not exist or is not a text channel")
    return [new Error("Channel does not exist or is not a text channel"), undefined]
  }

  // TODO: try catch on these fetches lol
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

    // Reached end of available messages
    if (messages.size < 100) break;
  }

  return [undefined, allMessages]
}
