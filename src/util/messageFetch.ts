import { ChannelType, type Client, type FetchMessagesOptions } from "discord.js";
import type pino from "pino";
import { constructMessage } from "../helpers/constructMessage";
import type { ParsedSavedMessage } from "types/Messages";

const MAX_MESSAGES = 100
const LIMIT_PER_REQUEST = 100

// TODO: extract this into generic type
type FetchResult = [success: boolean, result: ParsedSavedMessage[]]

export async function fetchChannelMessages(client: Client<boolean>, channelId: string, logger?: pino.Logger): Promise<FetchResult> {
  let allMessages = [] as ParsedSavedMessage[];
  let lastMessageId: string | undefined;

  const channel = await client.channels.fetch(channelId)

  if (!channel || channel.type !== ChannelType.GuildText) {
    logger?.error({ channelId }, "Channel does not exist or is not a text channel")
    return [false, []]
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

    if (messages.size < 100) break; // Reached end of available messages
  }

  // const savePath = getChannelPath(channelId)
  // await fs.writeFile(savePath, JSON.stringify(allMessages))

  return [true, allMessages]
}
