import { ChannelType, Message, type Client, type FetchMessagesOptions } from "discord.js";
import path from "path"
import fs from "fs/promises"

interface ParsedSavedMessage {
  author: string
  content: string
  id: string
  timeStamp: string
}

const getChannelPath = (channelId: string) => {
  const projectRoot = process.cwd();
  return path.join(projectRoot, "assets", "messages", channelId + ".json")
}

export async function getChannelMessages(client: Client<boolean>, channelId: string): Promise<[boolean, ParsedSavedMessage[]]> {
  const [exists, messages] = await getSavedMessages(channelId)
  const channel = await client.channels.fetch(channelId)

  if (!channel) {
    return [false, []]
  }

  if (!channel || channel.type !== ChannelType.GuildText) {
    return [false, []]
  }

  if (!exists) {
    try {
      const messages = await messageFetch(client, channelId)
      return [true, messages]
    } catch (e) {
      console.error(e)
      return [false, []]
    }
  }

  const latestSavedMessage = messages[0] as ParsedSavedMessage
  // get just the latest message
  const options: FetchMessagesOptions = { limit: 1 };

  const fetchedMsg = await channel.messages.fetch(options);
  if (fetchedMsg.size === 0) {
    return [false, []]
  }

  const latestFetchedMsg = fetchedMsg.first() as Message
  const isSameLastMsg = latestFetchedMsg.id === latestSavedMessage?.id

  if (isSameLastMsg) {
    console.log(isSameLastMsg)
    return [true, messages]
  }

  const latestSavedMsgTime = new Date(Number(latestSavedMessage.timeStamp))

  // check if last message saved was within last 24 hours
  const difference = latestFetchedMsg.createdAt.getTime() - latestSavedMsgTime.getTime()

  const hours = 1000 * 60 * 60 * 24
  if (hours >= difference) {
    return [true, messages]
  }


  try {
    const messages = await messageFetch(client, channelId)
    return [true, messages]
  } catch (e) {
    console.error(e)
    return [false, []]
  }

}


async function getSavedMessages(channelId: string): Promise<[boolean, ParsedSavedMessage[]]> {
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

async function messageFetch(client: Client<boolean>, channelId: string) {
  let allMessages = [] as ParsedSavedMessage[];
  let lastMessageId: string | undefined;

  const channel = await client.channels.fetch(channelId)

  if (!channel || channel.type !== ChannelType.GuildText) {
    throw new Error("Channel does not exist or is not a text channel")
  }

  const MAX_MESSAGES = 10_000

  while (allMessages.length < MAX_MESSAGES) {
    const options: FetchMessagesOptions = { limit: 100 }; // Max 100 per request
    if (lastMessageId) {
      options.before = lastMessageId;
    }

    const messages = await channel.messages.fetch(options);

    if (messages.size === 0) break; // No more messages

    const messagesNew = messages.map(el => {
      return {
        author: el.author.id,
        content: el.content,
        id: el.id,
        timeStamp: `${el.createdAt.getTime()}`
      } as ParsedSavedMessage
    })

    allMessages = [...allMessages, ...messagesNew]
    lastMessageId = messages.last()?.id;

    console.log(`Fetched ${allMessages.length} messages so far...`);

    if (messages.size < 100) break; // Reached end of available messages
  }

  const savePath = getChannelPath(channelId)

  await fs.writeFile(savePath, JSON.stringify(allMessages))

  return allMessages
}

