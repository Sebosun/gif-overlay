import type { Client, Message, OmitPartialGroupDMChannel } from "discord.js"
import type pino from "pino"
import { generateMarkovRefactor } from "../lib/markov/markov"
import { watchChannelsManager } from "../channels/watchChannels"

export async function markov(message: OmitPartialGroupDMChannel<Message<boolean>>, client: Client<boolean>, logger: pino.Logger): Promise<void> {
  const channelId = message.channelId

  const msg = message.content.split(" ")
  let input: string | undefined = undefined

  if (msg.length > 1) {
    msg.splice(0, 1)
    input = msg.join(" ")
  }

  if (!watchChannelsManager.isWatched(channelId)) {
    await message.reply("Generatemaxxing rn, doing my stuff on that grind fr fr no cap")
    const [watchError] = await watchChannelsManager.watch({ id: channelId, client, logger })
    if (watchError) {
      logger.error({ err: watchError }, "Failed to fetch channel messages")
      await message.reply("I lied I'm not doing anything, I lied to you once more. I deserve death")
      return
    }
  }

  const result = await generateMarkovRefactor(channelId, input)

  if (!result) {
    console.log("No result")
    message.reply("i am broken miserable man, i have nothing left to live for. i broke and the light is on only by chance")
    return
  }

  await message.reply(result)
}
