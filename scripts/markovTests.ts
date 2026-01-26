import { generateMarkovRefactor } from "../lib/markov";
import { getSavedMessages } from "../src/util/messageFetch";

const [success, messages] = await getSavedMessages('1104469255262580748')

if (!success) {
  throw new Error("no sucess no bueno")
}

const messageAsText = messages.map(el => el.content)

console.time("Markov")
console.log(generateMarkovRefactor(messageAsText, "naruto"))
console.timeEnd("Markov")
