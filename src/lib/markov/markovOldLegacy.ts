
type Markov = { [Key: string]: string[] }

type MarkovRefactorItems = Record<string, number>
type MarkovRefactor = Record<string, MarkovRefactorItems>

const stripRegex = /[$&+,;=?#|'^*()%")(]/g

const sanitize = (text?: string) => {
  if (!text) return ""
  return text.toLowerCase().replace(stripRegex, "")
}

const constructMarkovRefactor = (texts: string[], ngrams: number = 2): MarkovRefactor => {
  const markovChain = {} as MarkovRefactor

  for (const text of texts) {
    const split = text.split(" ")
    for (let i = 0; i < split.length; i++) {
      if (!split[i]) {
        continue
      }
      const word = sanitize(split[i])

      if (!markovChain[word]) {
        markovChain[word] = {}
      }

      const nextWords: string[] = []
      for (let j = 0; j < ngrams; j++) {
        console.log(i + j)
        const next = split[i + 1 + j]
        if (next) {
          nextWords.push(next)
        }
      }

      if (nextWords.length > 0) {
        const nextWord = sanitize(nextWords.join(" "))
        if (!markovChain[word][nextWord]) {
          markovChain[word][nextWord] = 0
        }
        markovChain[word][nextWord]++
      }
    }
  }

  return markovChain
}


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
  while (result.split(" ").length <= 6 && attempts <= 8) {
    attempts++
    if (attempts < 5) {
      result = generate(markovChain, firstMessage)
    } else {
      result = generate(markovChain)
    }
  }


  const markovKeys = Object.keys(markovChain)
  const acc = {} as Record<string, Record<string, number>>

  for (const el of markovKeys) {
    const val = markovChain[el]
    const localAcc = {} as Record<string, number>

    if (!val) {
      continue
    }

    for (const subkey of val) {
      if (!localAcc[subkey]) {
        localAcc[subkey] = 0
      }
      localAcc[subkey] += 1
    }

    acc[el] = localAcc
  }

  console.log(markovChain)
  console.log(constructMarkovRefactor(text))

  return result
}
