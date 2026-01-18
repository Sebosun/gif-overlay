import type { Message, OmitPartialGroupDMChannel } from "discord.js"
import { combineRandomImages } from "../../lib/combineRandomImages"
import { getUrl } from "../util/getUrl"

export async function boomerify(message: OmitPartialGroupDMChannel<Message<boolean>>): Promise<void> {
  const isRandom = message.content === ".boomerr" || message.content === '.bomerr'
  message.channel.sendTyping()

  try {
    const url = await getUrl(message)

    if (!url) {
      console.log("Couldnt find url")
      return
    }

    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
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
