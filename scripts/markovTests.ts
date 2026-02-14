import { getSavedMessages } from "@/helpers/messages"
import type { ParsedSavedMessage } from "types/Messages"

const [error, messages] = await getSavedMessages('1104469255262580748')

if (error) {
  throw error
}

// const messageAsText = messages.map(el => el.content)
// console.log(messages)
const acc = [] as string[]

for (let i = 0; i < messages.length; i++) {
  const cur = messages[i] as ParsedSavedMessage // pretty much guaranteed to exist
  const allNext = [] as ParsedSavedMessage[]

  const curDate = new Date(Number(cur.timeStamp))

  // Remember to break here
  for (let j = i + 1; j < messages.length; j++) {
    const next = messages[j]
    if (!next) break
    if (next.author !== cur.author) {
      break
    }

    const nextDate = new Date(Number(next.timeStamp))
    const maxTimeDifference = 1000 * 30

    const difference = curDate.getTime() - nextDate.getTime()
    if (difference >= maxTimeDifference) {
      console.log(maxTimeDifference >= difference, difference, next.content, cur.content)
      break
    }

    allNext.push(next)
    i = j
  }

  const content = allNext.map(el => el.content)
  acc.push(cur.content + content.join(" "))
  // const peek = messages[i + 1]
}
