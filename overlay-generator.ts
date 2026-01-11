import fs from "fs/promises";
import { overlayGif } from "./convert";
import { GifUtil } from "gifwrap";
import { Jimp } from "jimp";

const path = `./scripts/good-morning`;

async function generateOverlayedGif() {
  const ls = await fs.readdir(path);
  let i = 0;
  for (const el of ls) {
    if (el.endsWith("gif")) {
      const gif = await GifUtil.read(`${path}/${el}`);
      const exampleJimp = await Jimp.read("./example.jpg");
      const newName = `example-${i++}.gif`;
      const res = await overlayGif(exampleJimp, gif);
      await fs.writeFile(newName, res.buffer);
    }

    i++;
  }
}

generateOverlayedGif();
