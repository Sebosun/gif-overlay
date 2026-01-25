import { generateMarkov } from "../src/commandsRaw/markov";
import { getSavedMessages } from "../src/util/messageFetch";


const [success, messages] = await getSavedMessages('1104469255262580748')

if (!success) {
  throw new Error("no sucess no bueno")
}

const messageAsText = messages.map(el => el.content)
const text = messageAsText.join(" ").split(" ").filter(el => el !== "")

for (let index = 0; index < 50; index++) {
  console.log(generateMarkov(text))
}
