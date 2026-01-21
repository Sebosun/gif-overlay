import type { Message, OmitPartialGroupDMChannel } from "discord.js"
import { extractGif } from "../util/extractGif"
import { combineRandomEffect } from "../../lib/combineEffect"

export async function effect(message: OmitPartialGroupDMChannel<Message<boolean>>): Promise<void> {
  const interval = setInterval(async () => {
    await message.channel.sendTyping()
  }, 1000 * 10)

  try {
    const buffer = await extractGif(message)
    await message.channel.sendTyping()
    const result = await combineRandomEffect(buffer, true);
    if (!result) return;
    await message.channel.sendTyping()
    await message.channel.send({
      files: [{ attachment: result, name: "effect.gif" }],
    });
  } catch (e) {
    await message.reply("This aint if chef, I'm too weak for this one.")
    console.error("Something went wrong...", e);
  } finally {
    clearInterval(interval)
  }
}
