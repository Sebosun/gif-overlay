import { exit } from "node:process";
import { parseArgs } from "node:util";
import fs from "fs/promises";
import path from "path";
import { ffmpegCombineTomato } from "lib/ffmpeg";

async function cli() {
  const { positionals } = parseArgs({
    allowPositionals: true,
  });

  const savePath = positionals.pop();
  const targetPath = positionals.pop();

  if (!targetPath) {
    console.log("Missing path...");
    exit(1);
  }

  const exists = await fs.exists(targetPath);
  if (!exists) {
    console.error("Path does not exist...");
    exit(1);
  }

  const res = await ffmpegCombineTomato(targetPath);

  if (!res) {
    console.error("Failed to generate image");
    exit(1);
  }

  exit(0)
}

cli()
