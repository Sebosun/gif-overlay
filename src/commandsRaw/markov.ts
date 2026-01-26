import type { Client, Message, OmitPartialGroupDMChannel } from "discord.js"
import { getMessagesNoChecks } from "../util/messageFetch"
import { generateMarkovRefactor } from "../../lib/markov"

export async function markov(message: OmitPartialGroupDMChannel<Message<boolean>>, client: Client<boolean>): Promise<void> {
  const channelId = message.channelId
  const [success, messages] = await getMessagesNoChecks(client, channelId)

  if (!success) {
    return
  }

  const msg = message.content.split(" ")
  const firstWord = msg[1]?.toLowerCase() // .markov [me]

  const messageAsText = messages.map(el => el.content)
  const result = generateMarkovRefactor(messageAsText, firstWord)

  if (!result) {
    console.log("No result")
    message.reply("i am broken miserable man, i have nothing left to live for. i broke and the light is on only by chance")
    return
  }

  await message.reply(result)
}
