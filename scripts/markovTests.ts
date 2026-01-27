import { generateMarkovRefactor } from "../lib/markov";
import { getSavedMessages } from "../src/util/messageFetch";

const [success, messages] = await getSavedMessages('1104469255262580748')

if (!success) {
  throw new Error("no sucess no bueno")
}

const messageAsText = messages.map(el => el.content)

console.time("Markov")
console.log(await generateMarkovRefactor('1104469255262580748', "cat is cute"))
console.timeEnd("Markov")
