import type { Message, OmitPartialGroupDMChannel } from "discord.js"
import { combineRandomImages } from "../../lib/combineRandomImages"
import { getUrl } from "../util/getUrl"
import ffmpeg from "fluent-ffmpeg"
import fs from 'fs/promises'
import { Gif, GifUtil } from "gifwrap"

// thanks ai ig, discord is annoying enough where they will store (randomly!)
// certain gifs as mp4s and certain as thumbnails
async function mp4ToGif(mp4Url: string, outputPath: string): Promise<Gif> {
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
        await fs.unlink(tempMp4); // Clean up
        const res = await GifUtil.read(outputPath);
        resolve(res)
      })
      .on('error', reject);
  });
}

export async function boomerify(message: OmitPartialGroupDMChannel<Message<boolean>>): Promise<void> {
  const isRandom = message.content === ".boomerr" || message.content === '.bomerr'
  message.channel.sendTyping()

  try {
    let buffer: Buffer | Gif
    const url = await getUrl(message)
    const urlOBJ = new URL(url)

    if (!url) {
      console.log("Couldnt find url")
      return
    }
    const baseName = urlOBJ.pathname.split('/').at(-1)
    if (!baseName) {
      throw new Error("Missing basename for whateverreason")
    }

    if (baseName.endsWith('mp4')) {
      const resultName = baseName + ".mp4"
      buffer = await mp4ToGif(url, resultName)
    } else {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const localBuffer = Buffer.from(await response.arrayBuffer());

      if (baseName.endsWith('.gif')) {
        const resultName = baseName + ".gif"
        await fs.writeFile(resultName, localBuffer)
        buffer = await GifUtil.read(resultName)
      } else {
        buffer = localBuffer
      }

      if (!response.ok) {
        throw new Error("Error fetching from the url")
      }
    }

    await message.channel.sendTyping()
    const result = await combineRandomImages(buffer, true, isRandom);
    if (!result) return;
    await message.channel.sendTyping()
    await message.channel.send({
      files: [{ attachment: result, name: "boomer.gif" }],
    });
  } catch (e) {
    await message.reply("This aint if chef, I'm too weak for this one.")
    console.error("Something went wrong...", e);
  }
}
