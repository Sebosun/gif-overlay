import type { Client, Message, OmitPartialGroupDMChannel } from "discord.js"
import { getChannelMessages } from "../util/messageFetch"

export async function markov(message: OmitPartialGroupDMChannel<Message<boolean>>, client: Client<boolean>): Promise<void> {
  type Markov = { [Key: string]: string[] }

  const markovChain = {} as Markov

  const channelId = message.channelId
  const [success, messages] = await getChannelMessages(client, channelId)

  if (!success) {
    return
  }

  const messageAsText = messages.map(el => el.content)
  const text = messageAsText.join(" ").split(" ").filter(el => el !== "")

  for (let i = 0; i < text.length; i++) {
    if (!text[i]) {
      continue
    }
    const word = text[i]!.toLowerCase()

    if (!markovChain[word]) {
      markovChain[word] = []
    }

    const next = text[i + 1]
    const next2 = text[i + 2]
    if (next) {
      const nextWord = next.toLowerCase();
      if (nextWord) {
        markovChain[word].push(nextWord);
      }
    }

    if (next2) {
      const next2Word = next2.toLowerCase();
      if (next2Word) {
        markovChain[word].push(next2Word);
      }

    }
  }

  const result = [] as string[]

  const keys = Object.keys(markovChain)

  let next: string | undefined = undefined

  while (result.length <= 20) {
    let val: string;

    if (next && markovChain[next]) {
      val = next;
    } else {
      const randomKey = Math.floor(Math.random() * keys.length);
      val = keys[randomKey] as string;
    }

    if (!markovChain[val] || markovChain[val]?.length === 0) {
      // Dead end, pick a new random word
      next = undefined;
      continue;
    }

    result.push(val);

    const values = markovChain[val] as string[];
    const randomIdx = Math.floor(Math.random() * values.length);
    next = values[randomIdx];
  }

  await message.reply(result.join(" "))
}
