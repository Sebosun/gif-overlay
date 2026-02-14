import type { Client, Message, OmitPartialGroupDMChannel } from "discord.js"
import { combineRandomImagesFactory } from "../lib/combiner/combineRandomImages"
import { extractImage } from "../util/extractGif"
import { combineRandomEffect } from "../lib/combiner/combineEffect"
import type pino from "pino"
import { config } from "@/config"

export async function boomerify(message: OmitPartialGroupDMChannel<Message<boolean>>, _: Client<boolean>, logger: pino.Logger): Promise<void> {
  const isRandom = message.content === ".boomerr" || message.content === '.bomerr'

  const interval = setInterval(async () => {
    await message.channel.sendTyping()
  }, config.typingIndicatorIntervalMs)

  try {
    let start = performance.now();

    const [err, buffer] = await extractImage(message)
    if (err) {
      logger.error({ err }, 'Failed to extract image')
      await message.reply("This aint if chef, I'm too weak for this one.")
      return
    }
    logger.info({ duration: performance.now() - start }, 'Extracting gif')

    await message.channel.sendTyping()

    const addEffect = Math.floor(Math.random() * config.boomerifyEffectChanceMax);

    start = performance.now();
    let result = await combineRandomImagesFactory(buffer, true, isRandom);
    logger.info({ duration: performance.now() - start }, 'Combining images')

    if (addEffect === 1) {
      start = performance.now();
      result = await combineRandomEffect(result, false)
      logger.info({ duration: performance.now() - start }, 'Adding effect')
    }

    await message.channel.sendTyping()
    await message.channel.send({
      files: [{ attachment: result, name: "boomer.gif" }],
    });
  } catch (e) {
    logger.error({ err: e }, "Command failed")
    await message.reply("This aint if chef, I'm too weak for this one.")
  } finally {
    clearInterval(interval)
  }
}
