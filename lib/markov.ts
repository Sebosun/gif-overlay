import path from "path"
import fs from "fs/promises"

const stripRegex = /[$&+,;=?#|'^*()%")(\n]/g

type ChainLink = Map<string, number>
type MarkovChain = Map<string, ChainLink>

const sanitize = (text?: string) => {
  if (!text) return ""
  return text.toLowerCase().replace(stripRegex, "")
}

function replacer(key: string, value: Map<string, number>) {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()),
    };
  } else {
    return value;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function reviver(key: unknown, value: any) {
  if (typeof value === 'object' && value !== null && value.dataType === 'Map') {
    return new Map(value.value);
  }
  return value;
}

const constructMarkovRefactor = (texts: string[], ngrams: number = 2): MarkovChain => {
  const markovChain = new Map() as MarkovChain

  console.time("One message")
  for (const text of texts) {
    const split = text.split(" ")
    for (let i = 0; i < split.length; i++) {
      if (!split[i]) {
        continue
      }

      if (i + ngrams >= split.length) break

      const word = sanitize(split[i])

      if (!markovChain.has(word)) {
        markovChain.set(word, new Map<string, number>())
      }

      const nextWords: string[] = []

      for (let j = 0; j < ngrams; j++) {
        const next = split[i + 1 + j]
        if (!next) break
        nextWords.push(next)
      }

      if (nextWords.length !== ngrams) continue

      if (nextWords.length > 0) {
        const nextWord = sanitize(nextWords.join(" "))
        const curMarkov = markovChain.get(word)

        let number = 0
        const nextNumeral = curMarkov?.get(nextWord)

        if (nextNumeral) {
          number = Number(nextNumeral)
        }
        curMarkov?.set(nextWord, number + 1)
      }
    }
  }

  return markovChain
}

const calculateScore = (input?: Map<string, number>): number => {
  let totalScore = 0
  if (!input) return totalScore

  for (const [key, val] of input) {
    totalScore += key.length * val
  }

  return totalScore
}


function prepareTexts(text: string[]): string[] {
  const filterEmpty = text.filter(el => el !== "")
  const sanitized = filterEmpty.filter(el => el.split(" ").length > 1)

  return sanitized
}

export async function generateMarkovRefactor(channelId: string, firstMsg?: string) {
  // TODO: additional chceks dawg
  const savePathOne = getSavePath(channelId, 1)
  const savePathTwo = getSavePath(channelId, 2)
  const savePathThree = getSavePath(channelId, 3)

  const ngramsOneText = await fs.readFile(savePathOne, 'utf8')
  const ngramsTwoText = await fs.readFile(savePathTwo, 'utf8')
  const ngramsThreeText = await fs.readFile(savePathThree, 'utf8')

  const ngramsOne = JSON.parse(ngramsOneText, reviver) as MarkovChain
  const ngramsTwo = JSON.parse(ngramsTwoText, reviver) as MarkovChain
  const ngramsThree = JSON.parse(ngramsThreeText, reviver) as MarkovChain

  const countScores = (word: string) => {
    const res = ngramsOne.get(word)
    const res2 = ngramsTwo.get(word)
    const res3 = ngramsThree.get(word)
    // const res4 = ngramsFour.get(word)

    const score1 = calculateScore(res)
    const score2 = calculateScore(res2)
    const score3 = calculateScore(res3)
    // const score4 = calculateScore(res4)

    const chains = [] as [ChainLink, number][]
    if (res) chains.push([res, score1])
    if (res2) chains.push([res2, score2])
    if (res3) chains.push([res3, score3])
    // if (res4) chains.push([res4, score4])

    let biggest = chains.pop()
    if (!biggest) return undefined

    for (const ch of chains) {
      if (ch[1] > biggest[1]) {
        biggest = ch
      }
    }

    return biggest[0]
  }

  const pickWeightedRandom = (chain: ChainLink): string => {
    const arr: string[] = []
    for (const [key, val] of chain) {
      for (let i = 0; i < val; i++) {
        arr.push(key)
      }
    }
    const randomIdx = Math.floor(Math.random() * arr.length);
    if (arr[randomIdx]) {
      return arr[randomIdx]
    } else {
      const randomIdx = Math.floor(Math.random() * chain.size);
      const arr = [...chain.keys()]
      return arr[randomIdx] as string
    }

  }

  const generate = (initial?: string) => {
    let result = [] as string[]
    const keys = ngramsThree.keys()

    let next: string | undefined = initial

    if (initial && initial.split(" ").length > 0) {
      const els = initial.split(" ")
      next = els.pop()
      result = [...els]
    }

    if (next === undefined) {
      const randomKeyIdx = Math.floor(Math.random() * ngramsOne.size);
      const arr = [...keys]
      next = arr[randomKeyIdx]
    }

    while (next !== undefined && result.length <= 10) {
      result.push(next);

      const nextKey = next.split(" ").at(-1) // in two words, gets the last part

      if (!nextKey) {
        next = undefined;
        continue;
      }

      const curChain = countScores(nextKey)

      if (!curChain || curChain?.size === 0) {
        next = undefined;
        continue;
      }


      next = pickWeightedRandom(curChain)
    }

    return result.join(" ")
  }

  let result = generate(firstMsg?.toLocaleLowerCase())

  let attempts = 0
  while (result.split(" ").length <= 5 && attempts <= 8) {
    attempts++
    if (attempts < 5) {
      result = generate(firstMsg?.toLocaleLowerCase())
    } else {
      result = generate()
    }
  }

  return result
}

export const getSavePath = (channelId: string, count: number) => {
  const projectRoot = process.cwd();
  const fileName = `${channelId}-markov-ngram${count}.json`
  return path.join(projectRoot, "assets", "markov", fileName)
}

export async function generateAndSave(text: string[], channelId: string): Promise<void> {
  const sanitized = prepareTexts(text)

  const ngramsOne = constructMarkovRefactor(sanitized, 1)
  const ngramsTwo = constructMarkovRefactor(sanitized, 2)
  const ngramsThree = constructMarkovRefactor(sanitized, 3)

  const savePathOne = getSavePath(channelId, 1)
  const savePathTwo = getSavePath(channelId, 2)
  const savePathThree = getSavePath(channelId, 3)

  await fs.writeFile(savePathOne, JSON.stringify(ngramsOne, replacer))
  await fs.writeFile(savePathTwo, JSON.stringify(ngramsTwo, replacer))
  await fs.writeFile(savePathThree, JSON.stringify(ngramsThree, replacer))
}
