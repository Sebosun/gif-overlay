import fs from "fs/promises";
import { overlayGif } from "./convert";
import { GifUtil } from "gifwrap";
import { Jimp } from "jimp";
import path from "path";

const exampleJimp = await Jimp.read("./example.jpg");
const gifsPath = `./scripts/good-morning`;
const examplesPath = "./examples";

async function generateOverlayedGif() {
  const ls = await fs.readdir(gifsPath);
  let i = 0;

  const exists = await fs.exists(examplesPath);

  if (!exists) {
    await fs.mkdir(examplesPath); // this can throw ig, idc
  }

  for (const el of ls) {
    if (el.endsWith("gif")) {
      const gif = await GifUtil.read(`${gifsPath}/${el}`);
      const newName = `example-${i++}.gif`;
      const res = await overlayGif(exampleJimp, gif);
      const filePath = path.join(examplesPath, newName);
      await fs.writeFile(filePath, res.buffer);
    }

    i++;
  }
}

generateOverlayedGif();
