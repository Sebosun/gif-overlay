import type { Message, OmitPartialGroupDMChannel } from "discord.js"
import { generateMarkovRefactor } from "../../lib/markov"

export async function markov(message: OmitPartialGroupDMChannel<Message<boolean>>): Promise<void> {
  const channelId = message.channelId

  const msg = message.content.split(" ")
  const firstWord = msg[1]?.toLowerCase() // .markov [me]

  const result = await generateMarkovRefactor(channelId, firstWord)

  if (!result) {
    console.log("No result")
    message.reply("i am broken miserable man, i have nothing left to live for. i broke and the light is on only by chance")
    return
  }

  await message.reply(result)
}
