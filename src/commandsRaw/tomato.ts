import { extractImagePathName } from "@/util/extractGif"
import type { Client, Message, OmitPartialGroupDMChannel } from "discord.js"
import { ffmpegCombineTomato } from "@/lib/ffmpeg/combineTomato"
import { cleanupFiles } from "@/lib/files/cleanupFiles"
import type pino from "pino"
import { config } from "@/config"

export async function tomato(message: OmitPartialGroupDMChannel<Message<boolean>>, _: Client<boolean>, logger: pino.Logger): Promise<void> {
  const interval = setInterval(async () => {
    await message.channel.sendTyping()
  }, config.typingIndicatorIntervalMs)

  const msg = message.content.split(" ")

  let amount = 1
  for (const m of msg) {
    const tryInt = Number.parseInt(m, 10)
    if (!Number.isNaN(tryInt)) {
      amount = tryInt
    }
  }

  if (amount > config.maxTomatoAmount) {
    await message.reply("Try a lower number bozo don't explode my pc")
    clearInterval(interval)
    return
  }

  if (amount <= config.minTomatoAmount) {
    await message.reply(`Uuugh i'd like to throw ${amount} tomatoes please, grab em from the negativity of space`)
    clearInterval(interval)
    return
  }

  try {
    const [err, imagePath] = await extractImagePathName(message)

    if (err) {
      await message.reply(err.message)
      logger.error(err)
      return
    }

    await message.channel.sendTyping()

    const [unopt, opt] = await ffmpegCombineTomato(imagePath, amount)

    await message.channel.send({
      files: [{ attachment: opt, name: "tomato.gif" }],
    });

    cleanupFiles(unopt)
    cleanupFiles(opt)
    cleanupFiles(imagePath)
  } catch (e) {
    if (e instanceof Error) {
      logger.error(e.message)
    }
    await message.reply("This aint if chef, I'm too weak for this one.")
  } finally {
    clearInterval(interval)
  }
}
