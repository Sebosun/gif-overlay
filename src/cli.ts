import { exit } from "node:process";
import { parseArgs } from "node:util";
import fs from "fs/promises";
import path from "path";
import { Jimp } from "jimp";
import { combineRandomImages } from "../lib/combineRandomImages";

const { positionals } = parseArgs({
  allowPositionals: true,
});

const targetPath = positionals.pop();
let savePath = positionals.pop();

if (!targetPath) {
  console.log("Missing path...");
  exit(1);
}

const exists = await fs.exists(targetPath);
if (!exists) {
  console.error("Path does not exist...");
  exit(1);
}

const image = await Jimp.read(targetPath);
const res = await combineRandomImages(image, false, false);

if (!res) {
  console.error("Failed to generate image");
  exit(1);
}

const name = path.basename(targetPath).split(".")[0]; // for now lets assume it doesnt have additional dots

if (!savePath) {
  await fs.writeFile(`./${name}.gif`, res);
  exit();
}

savePath = path.join(savePath, `${name}.gif`);
await fs.writeFile(savePath, res);

console.log("Exists");
