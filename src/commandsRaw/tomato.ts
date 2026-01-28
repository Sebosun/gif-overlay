import type { Message, OmitPartialGroupDMChannel } from "discord.js"
import { extractImage } from "../util/extractGif"
import { combineWithTomato } from "../../lib/combineRandomImages"

export async function tomato(message: OmitPartialGroupDMChannel<Message<boolean>>): Promise<void> {
  const interval = setInterval(async () => {
    await message.channel.sendTyping()
  }, 1000 * 10)

  try {
    const buffer = await extractImage(message)
    await message.channel.sendTyping()
    const result = await combineWithTomato(buffer, true, true);

    if (!result) return;
    await message.channel.sendTyping()
    await message.channel.send({
      files: [{ attachment: result, name: "tomato.gif" }],
    });
  } catch (e) {
    await message.reply("This aint if chef, I'm too weak for this one.")
    console.error("Something went wrong...", e);
  } finally {
    clearInterval(interval)
  }
}
