import { spawn } from 'child_process'
import fs from 'fs/promises'
import { Gif, GifUtil } from "gifwrap"
import type { FlatCatch } from "@/types/Common"
import { config } from "@/config"

// thanks ai ig, discord is annoying enough where they will store (randomly!)
// certain gifs as mp4s and certain as thumbnails
export async function mp4ToGif(mp4Url: string, outputPath: string): Promise<FlatCatch<Gif>> {
  const response = await fetch(mp4Url);
  const buffer = Buffer.from(await response.arrayBuffer());
  const tempMp4 = 'temp.mp4';
  await fs.writeFile(tempMp4, buffer);

  return new Promise((resolve) => {
    const proc = spawn('ffmpeg', [
      '-y',
      '-i', tempMp4,
      '-vf', `fps=${config.mp4ToGifFps},scale=${config.mp4ToGifScaleWidth}:-1:flags=lanczos`,
      '-loop', `${config.gifLoopCount}`,
      outputPath
    ]);

    proc.on('close', async (code) => {
      try {
        await fs.unlink(tempMp4);
        if (code !== 0) {
          resolve([new Error(`ffmpeg exited with code ${code}`), undefined]);
          return;
        }
        const res = await GifUtil.read(outputPath);
        resolve([undefined, res]);
      } catch (e) {
        if (e instanceof Error) {
          resolve([e, undefined]);
          return
        }
        resolve([new Error("Unknown error in mp4ToGif"), undefined]);
      }
    });

    proc.on('error', (e) => resolve([e, undefined]));
  });
}

