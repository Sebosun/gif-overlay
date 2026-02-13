// Require the necessary discord.js classes
import { generateSaveMarkov } from "lib/markov/markov";
import { logger } from "@/logger";
import { getMessagesFilePaths, getSavedMessages, type MessageFile } from "@/helpers/messages";

async function updateMarkovByChannelId(channel: MessageFile) {
  const channelLogger = logger.child({ channel: channel })
  const start = performance.now()

  channelLogger.info(channel, "Starting saving channel msgs and parsing markov")
  const [success, messages] = await getSavedMessages(channel.id)
  if (success) {
    const messageAsText = messages.map(el => el.content)
    await generateSaveMarkov(messageAsText, channel.id)
  }
  channelLogger.info({ duration: performance.now() - start, wasFetchSuccess: success }, "Ended saving channel msgs and parsing markov")
}

export async function updateSavedMarkovs() {
  const channelFiles = await getMessagesFilePaths()

  for (const channel of channelFiles) {
    await updateMarkovByChannelId(channel)
  }
}

// export async function getMessagesWithoutChecks(client: Client<boolean>, channelId: string): Promise<[boolean, ParsedSavedMessage[]]> {
//   const [exists, messages] = await getSavedMessages(channelId)
//   const channel = await client.channels.fetch(channelId)
//
//   if (!channel || channel.type !== ChannelType.GuildText) {
//     return [false, []]
//   }
//
//   if (!exists) {
//     try {
//       const messages = await fetchChannelMessages(client, channelId)
//       return [true, messages]
//     } catch (e) {
//       console.error(e)
//       return [false, []]
//     }
//   }
//
//   return [true, messages]
// }

// depreciated
// export async function updateChannelMessages(client: Client<boolean>, channelId: string, logger: pino.Logger): Promise<[boolean, ParsedSavedMessage[]]> {
//   const [exists, messages] = await getSavedMessages(channelId)
//   const channel = await client.channels.fetch(channelId)
//
//   if (!channel) {
//     return [false, []]
//   }
//
//   if (!channel || channel.type !== ChannelType.GuildText) {
//     return [false, []]
//   }
//
//   if (!exists) {
//     try {
//       logger.info("Channel doesnt exist, fetching")
//       const messages = await fetchChannelMessages(client, channelId, logger)
//       return [true, messages]
//     } catch (e) {
//       logger.info({ err: e }, "error fetching channel")
//       return [false, []]
//     }
//   }
//
//   const latestSavedMessage = messages[0] as ParsedSavedMessage | undefined
//
//   // get just the latest message
//   const options: FetchMessagesOptions = { limit: 1 };
//
//   const fetchedMsg = await channel.messages.fetch(options);
//   if (fetchedMsg.size === 0) {
//     return [false, []]
//   }
//
//   const latestFetchedMsg = fetchedMsg.first() as Message
//   const isSameLastMsg = latestFetchedMsg.id === latestSavedMessage?.id
//
//   if (isSameLastMsg) {
//     return [true, messages]
//   }
//
//   const latestSavedMsgTime = new Date(Number(latestSavedMessage?.timeStamp))
//
//   // check if last message saved was within last 4 hours
//   const difference = latestFetchedMsg.createdAt.getTime() - latestSavedMsgTime.getTime()
//
//   const REFRESH_HOURS = 1000 * 60 * 60 * 4
//   if (REFRESH_HOURS >= difference) {
//     return [true, messages]
//   }
//
//   try {
//     logger.info("Channel is outdated, fetching")
//     const messages = await fetchChannelMessages(client, channelId, logger)
//     return [true, messages]
//   } catch (e) {
//     logger.info({ err: e }, "Error fetching channel")
//     return [false, []]
//   }
// }
