import { getSavedMessages, type ParsedSavedMessage } from "../src/util/messageFetch";

const [success, messages] = await getSavedMessages('1104469255262580748')

if (!success) {
  throw new Error("no sucess no bueno")
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

console.log(acc.length)
console.log(messages.map(el => el.content).length)

// console.log(prepareTexts(messageAsText))

// console.log(await generateMarkovRefactor('1104469255262580748', "cat is cute"))
// console.timeEnd("Markov")
