import type { Message, OmitPartialGroupDMChannel } from "discord.js"
import { extractImagePathName } from "../util/extractGif"
import { ffmpegCombineTomato } from "lib/ffmpeg"
import { cleanupFiles } from "lib/cleanupFiles"

export async function tomato(message: OmitPartialGroupDMChannel<Message<boolean>>): Promise<void> {
  const interval = setInterval(async () => {
    await message.channel.sendTyping()
  }, 1000 * 10)

  const msg = message.content.split(" ")

  let amount = 1
  for (const m of msg) {
    const tryInt = Number.parseInt(m, 10)
    if (!Number.isNaN(tryInt)) {
      amount = tryInt
    }
  }

  if (amount > 50) {
    await message.reply("Try a lower number bozo don't explode my pc")
    clearInterval(interval)
    return
  }

  if (amount < -2) {
    await message.reply(`Uuugh i'd like to throw ${amount} tomatoes please, grab em from the negativity of space`)
    clearInterval(interval)
    return
  }


  try {
    const imagePath = await extractImagePathName(message)
    await message.channel.sendTyping()

    const [unopt, opt] = await ffmpegCombineTomato(imagePath, amount)

    await message.channel.send({
      files: [{ attachment: opt, name: "tomato.gif" }],
    });

    cleanupFiles(unopt)
    cleanupFiles(opt)
    cleanupFiles(imagePath)
  } catch (e) {
    await message.reply("This aint if chef, I'm too weak for this one.")
    console.error("Something went wrong...", e);
  } finally {
    clearInterval(interval)
  }
}
