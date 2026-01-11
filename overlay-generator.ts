import fs from "fs/promises";
import { overlayGif } from "./convert";
import { GifUtil } from "gifwrap";

const path = `./scripts/good-morning`;

async function generateOverlayedGif() {
  const ls = await fs.readdir(path);
  let i = 0;
  for (const el of ls) {
    if (el.endsWith("gif")) {
      const gif = await GifUtil.read(`${path}/${el}`);
      overlayGif("./example.jpg", gif, `example-${i++}.gif`);
    }

    i++;
  }
}

generateOverlayedGif();
