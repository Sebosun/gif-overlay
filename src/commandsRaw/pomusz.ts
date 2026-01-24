import type { OmitPartialGroupDMChannel, Message } from "discord.js";

export async function pomusz(message: OmitPartialGroupDMChannel<Message<boolean>>): Promise<void> {
  message.reply(`
\`\`\`
.boomer - boomerify an image
.boomerr - boomerify an image, random placements
.cute - apply an random "cute" overlay onto an image
\`\`\`
    `)
}

