const txt = "the thereemin is theirs ok yes? yes it is, this is a theremin"
const order = 3

const ngrams = {} as Record<string, number>

function main() {
  for (let i = 0; i < txt.length - order; i++) {
    const gram = txt.substring(i, i + 3)
    if (!ngrams[gram]) {
      ngrams[gram] = 1
    } else {
      ngrams[gram]++
    }
  }

  console.log(ngrams)
}

main()
