import type { Message, OmitPartialGroupDMChannel } from "discord.js"
import { extractImagePathName } from "../util/extractGif"
import { ffmpegCombineTomato } from "lib/ffmpeg"

export async function tomato(message: OmitPartialGroupDMChannel<Message<boolean>>): Promise<void> {
  const interval = setInterval(async () => {
    await message.channel.sendTyping()
  }, 1000 * 10)

  try {
    const imagePath = await extractImagePathName(message)
    await message.channel.sendTyping()

    const res = await ffmpegCombineTomato(imagePath)

    // if (!result) return;
    // await message.channel.sendTyping()
    await message.channel.send({
      files: [{ attachment: res, name: "tomato.gif" }],
    });
  } catch (e) {
    await message.reply("This aint if chef, I'm too weak for this one.")
    console.error("Something went wrong...", e);
  } finally {
    clearInterval(interval)
  }
}
