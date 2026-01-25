import { generateMarkov } from "../src/commandsRaw/markov";
import { getSavedMessages } from "../src/util/messageFetch";

const [success, messages] = await getSavedMessages('1104469255262580748')

if (!success) {
  throw new Error("no sucess no bueno")
}

const messageAsText = messages.map(el => el.content)

for (let index = 0; index < 5; index++) {
  const result = generateMarkov(messageAsText, "me")
  console.log(index + 1, result, result.split(" ").length, "\n")
}
