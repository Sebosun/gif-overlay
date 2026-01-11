import fs from "fs/promises";
import { GifUtil } from "gifwrap";
import path from "path";
import { overlayTwoGifs } from "../lib/overlayTwoGifs";
import { overlayGif } from "../lib/overlayGifImage";
import { Jimp } from "jimp";

const ASSETS_DIR = "../assets/";
const exampleLoc = "../example.jpg";

async function generateAtRandom() {
  const ls = await fs.readdir(ASSETS_DIR);
  let name = "example-";

  const randomGifs = [] as string[];

  for (const folder of ls) {
    const folderPath = path.join(ASSETS_DIR, folder);
    const items = await fs.readdir(folderPath);
    const gifs = items.filter((el) => el.endsWith(".gif"));

    const randomEl = Math.floor(Math.random() * gifs.length);
    const randomGif = gifs[randomEl];
    if (randomGif) {
      const gifPath = path.join(folderPath, randomGif);
      name += randomGif.split(".")[0];
      randomGifs.push(gifPath);
    }
  }

  const exampleJimp = await Jimp.read(exampleLoc);
  const firstGifLoc = randomGifs.pop();

  if (!firstGifLoc) {
    console.error("Couldnt get the first gif...");
    return;
  }

  const firstGif = await GifUtil.read(firstGifLoc);
  let gif = await overlayGif(exampleJimp, firstGif);

  for (const el of randomGifs) {
    const gifElem = await GifUtil.read(el);

    gif = await overlayTwoGifs({
      gifPrimary: gif,
      gifSecondary: gifElem,
      placement: "bottom-right",
    });
  }

  await fs.writeFile(`${name}.gif`, gif.buffer);
}

for (let i = 0; i < 1000; i++) {
  console.log(`Generating ${i + 1} examples out of ${1000} `);
  await generateAtRandom();
}
