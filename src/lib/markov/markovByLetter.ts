export function markovByLetter(text: string) {
  const txt = text
  const order = 6;
  const ngrams = {} as Record<string, string[]>;

  for (let i = 0; i <= txt.length - order; i++) {
    const gram = txt.substring(i, i + order);

    if (!ngrams[gram]) {
      ngrams[gram] = [];
    }
    ngrams[gram].push(txt.charAt(i + order));
  }


  const keys = Object.keys(ngrams)
  const randomKeyIdx = Math.floor(Math.random() * keys.length);

  let currentGram = keys[randomKeyIdx] as string
  let result = currentGram;

  while (result.split(" ").length <= 20) {
    const possibilities = ngrams[currentGram];
    if (!possibilities) {
      break;
    }
    const randIdx = Math.floor(Math.random() * possibilities.length)
    const next = possibilities[randIdx]?.toLowerCase()
    result += next;
    const len = result.length;
    currentGram = result.substring(len - order, len);
  }


  return result
}
