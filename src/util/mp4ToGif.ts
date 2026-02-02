import ffmpeg from "fluent-ffmpeg"
import fs from 'fs/promises'
import { Gif, GifUtil } from "gifwrap"

// thanks ai ig, discord is annoying enough where they will store (randomly!)
// certain gifs as mp4s and certain as thumbnails
export async function mp4ToGif(mp4Url: string, outputPath: string): Promise<Gif> {
  const response = await fetch(mp4Url);
  const buffer = Buffer.from(await response.arrayBuffer());
  const tempMp4 = 'temp.mp4';
  await fs.writeFile(tempMp4, buffer);

  return new Promise((resolve, reject) => {
    ffmpeg(tempMp4)
      .outputOptions([
        '-vf', 'fps=10,scale=320:-1:flags=lanczos',
        '-loop', '0'
      ])
      .save(outputPath)
      .on('end', async () => {
        try {
          await fs.unlink(tempMp4); // Clean up
          const res = await GifUtil.read(outputPath);
          resolve(res)
        } catch (e) {
          reject(e)
        }
      })
      .on('error', reject);
  });
}

