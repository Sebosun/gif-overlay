import { type Client, type Message, type OmitPartialGroupDMChannel } from "discord.js";
import { combineRandomImages } from "../../lib/combineRandomImages";
import { getUrl } from "../util/getUrl";


export async function rawCommandsManager(message: OmitPartialGroupDMChannel<Message<boolean>>, client: Client<boolean>): Promise<void> {
  if (client.user?.id === message.author.id) {
    console.log("Same id", client.user.id, message.author.id);
    return;
  }

  const isBoomerify = message.content.startsWith('.boomer') || message.content.startsWith(".bomer")
  const isPomusz = message.content === '.pomusz'

  if (isBoomerify) {
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
      const result = await combineRandomImages(buffer, true, isRandom);
      if (!result) return;

      await message.channel.send({
        files: [{ attachment: result, name: "boomer.gif" }],
      });
    } catch (e) {
      await message.reply("This aint if chef, I'm too weak for this one.")
      console.error("Something went wrong...", e);
    }
  } else if (isPomusz) {
    message.reply(`
\`\`\`
.boomer - boomerify an image
.boomerr - boomerify an image, random placements
\`\`\`
    `)
  }
}
