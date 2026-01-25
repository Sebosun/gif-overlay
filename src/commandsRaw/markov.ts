import type { Client, Message, OmitPartialGroupDMChannel } from "discord.js"
import { getMessagesNoChecks } from "../util/messageFetch"

type Markov = { [Key: string]: string[] }

export async function markov(message: OmitPartialGroupDMChannel<Message<boolean>>, client: Client<boolean>): Promise<void> {
  const channelId = message.channelId
  const [success, messages] = await getMessagesNoChecks(client, channelId)

  if (!success) {
    return
  }

  const msg = message.content.split(" ")
  const firstWord = msg[1] // .markov [me]

  const messageAsText = messages.map(el => el.content)
  const result = generateMarkov(messageAsText, firstWord)

  if (!result) {
    console.log("No result")
    message.reply("i am broken miserable man, i have nothing left to live for. i broke and the light is on only by chance")
    return
  }

  await message.reply(result)
}

const stripRegex = /[$&+,;=?#|'^*()%")(]/g


const constructMarkov = (texts: string[]): Markov => {
  const markovChain = {} as Markov

  for (const text of texts) {
    const split = text.split(" ")
    for (let i = 0; i < split.length; i++) {
      if (!split[i]) {
        continue
      }

      // const word = text[i]!.toLowerCase()
      const word = split[i]!.toLowerCase().replace(stripRegex, "")

      if (!markovChain[word]) {
        markovChain[word] = []
      }

      const next = split[i + 1]
      if (next) {
        // const nextWord = next.toLowerCase()
        const nextWord = next.toLowerCase().replace(stripRegex, "");
        if (nextWord) {
          markovChain[word].push(nextWord);
        }
      }
    }
  }

  return markovChain
}

const generate = (markov: Markov, firstMessage?: string): string => {
  const result = [] as string[]
  const keys = Object.keys(markov)

  let next: string | undefined = firstMessage

  while (result.length <= 20) {
    let val: string;

    if (next && markov[next]) {
      val = next;
    } else {
      const randomKey = Math.floor(Math.random() * keys.length);
      val = keys[randomKey] as string;
    }

    if (!markov[val] || markov[val]?.length === 0) {
      // Dead end, pick a new random word
      next = undefined;
      continue;
    }

    result.push(val);

    const values = markov[val] as string[];
    const randomIdx = Math.floor(Math.random() * values.length);
    next = values[randomIdx];
  }

  return result.join(" ")
}

export function generateMarkov(text: string[], firstMessage?: string): string {
  const textSanitized = text.filter(el => el !== "").filter(el => el.split(" ").length > 1)
  const markovChain = constructMarkov(textSanitized)
  const result = generate(markovChain, firstMessage)

  return result
}
