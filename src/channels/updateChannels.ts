// Require the necessary discord.js classes
import { generateSaveMarkov } from "lib/markov/markov";
import { logger } from "@/logger";
import { getMessagesFilePaths, getSavedMessages, type MessageFile } from "@/helpers/messages";
import type { FlatPromise } from "types/Common";

async function updateMarkovByChannelId(channel: MessageFile): FlatPromise {
  const channelLogger = logger.child({ channel: channel })
  const start = performance.now()

  channelLogger.info(channel, "Starting saving channel msgs and parsing markov")
  const [error, messages] = await getSavedMessages(channel.id)

  if (error) {
    channelLogger.info({ duration: performance.now() - start }, "Saving markov failed")
    return [error, undefined]
  }

  const messageAsText = messages.map(el => el.content)
  await generateSaveMarkov(messageAsText, channel.id)
  channelLogger.info({ duration: performance.now() - start }, "Ended saving channel msgs and parsing markov")

  return [undefined, undefined]
}

export async function updateSavedMarkovs(): FlatPromise {
  const [error, files] = await getMessagesFilePaths()
  if (error) {
    return [error, undefined]
  }

  for (const channel of files) {
    await updateMarkovByChannelId(channel)
  }

  return [undefined, undefined]
}
