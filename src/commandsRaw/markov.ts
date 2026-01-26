import type { Client, Message, OmitPartialGroupDMChannel } from "discord.js"
import { getMessagesNoChecks } from "../util/messageFetch"
import fs from "fs/promises"

type Markov = { [Key: string]: string[] }

export async function markov(message: OmitPartialGroupDMChannel<Message<boolean>>, client: Client<boolean>): Promise<void> {
  const channelId = message.channelId
  const [success, messages] = await getMessagesNoChecks(client, channelId)

  if (!success) {
    return
  }

  const msg = message.content.split(" ")
  const firstWord = msg[1]?.toLowerCase() // .markov [me]

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

  const ngrams = 1

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

      const next = split[i + ngrams]
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


  while (next === undefined) {
    const randomKeyIdx = Math.floor(Math.random() * keys.length);
    next = keys[randomKeyIdx] as string;
  }

  while (next !== undefined && result.length <= 20) {
    result.push(next);

    if (!markov[next] || markov[next]?.length === 0) {
      next = undefined;
      continue;
    }

    const values = markov[next] as string[];
    const randomIdx = Math.floor(Math.random() * values.length);
    next = values[randomIdx];
  }

  return result.join(" ")
}

export function generateMarkov(text: string[], firstMessage?: string): string {
  const textSanitized = text.filter(el => el !== "").filter(el => el.split(" ").length > 1)
  const markovChain = constructMarkov(textSanitized)

  let result = generate(markovChain, firstMessage)

  let attempts = 0
  while (result.split(" ").length <= 6) {
    if (attempts < 5) {
      result = generate(markovChain, firstMessage)
    } else {
      result = generate(markovChain)
    }
    attempts++
  }


  // const markovKeys = Object.keys(markovChain)
  // const acc = {} as Record<string, Record<string, number>>
  //
  // for (const el of markovKeys) {
  //   const val = markovChain[el]
  //   const localAcc = {} as Record<string, number>
  //
  //   if (!val) {
  //     continue
  //   }
  //
  //   for (const subkey of val) {
  //     if (!localAcc[subkey]) {
  //       localAcc[subkey] = 0
  //     }
  //     localAcc[subkey] += 1
  //   }
  //
  //   acc[el] = localAcc
  // }
  //
  // fs.writeFile('./markov.json', JSON.stringify({ elements: acc }))

  return result
}
