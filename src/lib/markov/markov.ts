import path from "path";
import fs from "fs/promises";
import { restoreStringifiedMap, stringifyMap } from "@/lib/stringifyMap";
import type { FlatCatch } from "@/types/Common";
import { config } from "@/config";
import { getAssetsDir, getMarkovPath } from "../files/useLocation";

const stripRegex = /[$&+,;=?#|'^*()%")(\n]/g;

type ChainLink = Map<string, number>;
type MarkovChain = Map<string, ChainLink>;

/**
 * Normalizes a token for use as a Markov chain key.
 *
 * @param text - Token or n-gram to normalize.
 * @returns Lowercase text with configured punctuation removed.
 */
const sanitize = (text?: string) => {
  if (!text) return "";
  return text.toLowerCase().replace(stripRegex, "");
};

/**
 * Builds a weighted n-gram transition chain from source messages.
 *
 * @param texts - Messages from which to derive word transitions.
 * @param ngrams - Number of consecutive words in each transition target.
 * @returns A map of source words to weighted next n-grams.
 */
const constructMarkovRefactor = (
  texts: string[],
  ngrams: number = config.markovDefaultNgrams,
): MarkovChain => {
  const markovChain = new Map() as MarkovChain;

  for (const text of texts) {
    const split = text.split(" ");
    for (let i = 0; i < split.length; i++) {
      if (!split[i]) {
        continue;
      }

      if (i + ngrams >= split.length) break;

      const word = sanitize(split[i]);

      if (!markovChain.has(word)) {
        markovChain.set(word, new Map<string, number>());
      }

      const nextWords: string[] = [];

      for (let j = 0; j < ngrams; j++) {
        const next = split[i + 1 + j];
        if (!next) break;
        nextWords.push(next);
      }

      if (nextWords.length !== ngrams) continue;

      if (nextWords.length > 0) {
        const nextWord = sanitize(nextWords.join(" "));
        const curMarkov = markovChain.get(word);

        let number = 0;
        const nextNumeral = curMarkov?.get(nextWord);

        if (nextNumeral) {
          number = Number(nextNumeral);
        }
        curMarkov?.set(nextWord, number + 1);
      }
    }
  }

  return markovChain;
};

/**
 * Calculates a weighted score for a chain's possible next n-grams.
 *
 * @param input - Weighted transitions to score.
 * @returns The sum of each n-gram's character length multiplied by its frequency.
 */
const calculateScore = (input?: Map<string, number>): number => {
  let totalScore = 0;
  if (!input) return totalScore;

  for (const [key, val] of input) {
    totalScore += key.length * val;
  }

  return totalScore;
};

/**
 * Removes empty and single-word messages that cannot form Markov transitions.
 *
 * @param text - Raw messages collected from a channel.
 * @returns Messages suitable for building Markov chains.
 */
export function prepareTexts(text: string[]): string[] {
  const filterEmpty = text.filter((el) => el !== "");
  const sanitized = filterEmpty.filter((el) => el.split(" ").length > 1);

  return sanitized;
}

/**
 * Generates text from saved one-, two-, and three-gram chains for a channel.
 *
 * A supplied seed is retried before falling back to an unseeded chain start when
 * generated text is shorter than the configured minimum length.
 *
 * @param channelId - Channel whose saved chains are used.
 * @param firstMsg - Optional seed text for generation.
 * @returns Generated Markov text.
 */
export async function generateMarkovRefactor(channelId: string, firstMsg?: string) {
  // TODO: additional chceks dawg
  // ... ciekawe co autor mial na mysli tutaj bo juz nie pamietam
  const savePathOne = getSavePath(channelId, 1);
  const savePathTwo = getSavePath(channelId, 2);
  const savePathThree = getSavePath(channelId, 3);

  const ngramsOneText = await fs.readFile(savePathOne, "utf8");
  const ngramsTwoText = await fs.readFile(savePathTwo, "utf8");
  const ngramsThreeText = await fs.readFile(savePathThree, "utf8");

  const ngramsOne = restoreStringifiedMap(ngramsOneText) as MarkovChain;
  const ngramsTwo = restoreStringifiedMap(ngramsTwoText) as MarkovChain;
  const ngramsThree = restoreStringifiedMap(ngramsThreeText) as MarkovChain;

  const countScores = (word: string) => {
    const res = ngramsOne.get(word);
    const res2 = ngramsTwo.get(word);
    const res3 = ngramsThree.get(word);
    // const res4 = ngramsFour.get(word)

    const score1 = calculateScore(res);
    const score2 = calculateScore(res2);
    const score3 = calculateScore(res3);
    // const score4 = calculateScore(res4)

    const chains = [] as [ChainLink, number][];
    if (res) chains.push([res, score1]);
    if (res2) chains.push([res2, score2]);
    if (res3) chains.push([res3, score3]);
    // if (res4) chains.push([res4, score4])

    let biggest = chains.pop();
    if (!biggest) return undefined;

    for (const ch of chains) {
      if (ch[1] > biggest[1]) {
        biggest = ch;
      }
    }

    return biggest[0];
  };

  const pickWeightedRandom = (chain: ChainLink): string => {
    const arr: string[] = [];
    for (const [key, val] of chain) {
      for (let i = 0; i < val; i++) {
        arr.push(key);
      }
    }
    const randomIdx = Math.floor(Math.random() * arr.length);
    if (arr[randomIdx]) {
      return arr[randomIdx];
    } else {
      const randomIdx = Math.floor(Math.random() * chain.size);
      const arr = [...chain.keys()];
      return arr[randomIdx] as string;
    }
  };

  const generate = (initial?: string) => {
    let result = [] as string[];
    const keys = ngramsThree.keys();

    let next: string | undefined = initial;

    if (initial && initial.split(" ").length > 0) {
      const els = initial.split(" ");
      next = els.pop();
      result = [...els];
    }

    if (next === undefined) {
      const randomKeyIdx = Math.floor(Math.random() * ngramsOne.size);
      const arr = [...keys];
      next = arr[randomKeyIdx];
    }

    while (next !== undefined && result.length <= config.markovMaxResultLength) {
      result.push(next);

      const nextKey = next.split(" ").at(-1); // in two words, gets the last part

      if (!nextKey) {
        next = undefined;
        continue;
      }

      const curChain = countScores(nextKey);

      if (!curChain || curChain?.size === 0) {
        next = undefined;
        continue;
      }

      next = pickWeightedRandom(curChain);
    }

    return result.join(" ");
  };

  let result = generate(firstMsg?.toLocaleLowerCase());

  let attempts = 0;
  while (
    result.split(" ").length <= config.markovMinWordCount &&
    attempts <= config.markovMaxAttempts
  ) {
    attempts++;
    if (attempts < config.markovSeedAttemptThreshold) {
      result = generate(firstMsg?.toLocaleLowerCase());
    } else {
      result = generate();
    }
  }

  return result;
}

/**
 * Gets the persisted Markov n-gram file path for a channel.
 *
 * @param channelId - Channel that owns the chain.
 * @param count - N-gram size represented by the file.
 * @returns Absolute path to the chain's JSON file.
 */
export const getSavePath = (channelId: string, count: number) => {
  const fileName = `${channelId}-markov-ngram${count}.json`;
  return path.join(getMarkovPath(), fileName);
};

/**
 * Builds and persists one-, two-, and three-gram Markov chains for a channel.
 *
 * @param text - Raw messages collected from the channel.
 * @param channelId - Channel that owns the generated chains.
 * @returns A tuple containing a write error, if one occurred.
 */
export async function generateSaveMarkov(text: string[], channelId: string): Promise<FlatCatch> {
  const sanitized = prepareTexts(text);

  const ngramsOne = constructMarkovRefactor(sanitized, 1);
  const ngramsTwo = constructMarkovRefactor(sanitized, 2);
  const ngramsThree = constructMarkovRefactor(sanitized, 3);

  const savePathOne = getSavePath(channelId, 1);
  const savePathTwo = getSavePath(channelId, 2);
  const savePathThree = getSavePath(channelId, 3);

  try {
    await fs.writeFile(savePathOne, stringifyMap(ngramsOne));
    await fs.writeFile(savePathTwo, stringifyMap(ngramsTwo));
    await fs.writeFile(savePathThree, stringifyMap(ngramsThree));
    return [undefined, undefined];
  } catch (e) {
    if (e instanceof Error) {
      return [e, undefined];
    }
    return [new Error("Something went wrong during file save"), undefined];
  }
}
