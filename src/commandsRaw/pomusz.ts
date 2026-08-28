import type { OmitPartialGroupDMChannel, Message } from "discord.js";
import { manualCommands, MODIFIER, type Commands } from "./rawCommandsManager";

export async function pomusz(message: OmitPartialGroupDMChannel<Message<boolean>>): Promise<void> {
  const keys = Object.keys(manualCommands) as Commands[]
  let acc = ``

  for (const key of keys) {
    const command = manualCommands[key]
    const triggersStr = command.triggers.map(el => `${MODIFIER}${el}`).join(" ")
    const commanDesc = `${triggersStr} - ${command.description} \n`
    acc += commanDesc
  }

  message.reply(`
\`\`\`
${acc}
\`\`\`
    `)
}

