import type { Message, OmitPartialGroupDMChannel } from "discord.js"
import { combineRandomImages } from "../../lib/combineRandomImages"
import { extractGif } from "../util/extractGif"
import { combineRandomEffect } from "../../lib/combineEffect"

export async function boomerify(message: OmitPartialGroupDMChannel<Message<boolean>>): Promise<void> {
  const isRandom = message.content === ".boomerr" || message.content === '.bomerr'

  const interval = setInterval(async () => {
    await message.channel.sendTyping()
  }, 1000 * 10)

  try {
    const buffer = await extractGif(message)
    await message.channel.sendTyping()

    const addEffect = Math.floor(Math.random() * 2);

    let result = await combineRandomImages(buffer, true, isRandom);
    if (addEffect === 1) {
      console.log("Adding effect")
      result = await combineRandomEffect(result, false)
    }

    await message.channel.sendTyping()
    await message.channel.send({
      files: [{ attachment: result, name: "boomer.gif" }],
    });
  } catch (e) {
    console.error("Something went wrong...", e);
    await message.reply("This aint if chef, I'm too weak for this one.")
  } finally {
    clearInterval(interval)
  }
}
