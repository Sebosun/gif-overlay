import { type Client, type Message, type OmitPartialGroupDMChannel } from "discord.js";
import { boomerify } from "./boomerify";
import { pomusz } from "./pomusz";
import { effect } from "./effect";
import { markov } from "./markov";
import { logger } from "../logger";
import type pino from "pino";

export type ManualCommand = (message: OmitPartialGroupDMChannel<Message<boolean>>, client: Client<boolean>, logger: pino.Logger) => Promise<void>
export type Commands = "boomerify" | "pomusz" | "effect" | "markov"

export interface CommandDetails {
  description: string
  exec: ManualCommand
  name: Commands
  triggers: string[]
}

export const MODIFIER = "."

export const manCommandsRefact: Record<Commands, CommandDetails> = {
  boomerify: {
    name: "boomerify",
    description: `boomerify an image. Use .boomerr for more random placements`,
    exec: boomerify,
    triggers: ["boomer", "bomer", "boomerr"]
  },
  pomusz: {
    name: "pomusz",
    description: `displays help information`,
    exec: pomusz,
    triggers: ["pomusz", "taskete"],
  },
  effect: {
    name: "effect",
    description: `apply an random "cute" overlay onto an image`,
    exec: effect,
    triggers: ["cute", "effect"],
  },
  markov: {
    name: "markov",
    description: "generate a random sentence from other sentences said in the channel",
    exec: markov,
    triggers: ["markov", "random"],
  },
} as const


export async function rawCommandsManager(message: OmitPartialGroupDMChannel<Message<boolean>>, client: Client<boolean>): Promise<void> {
  // Our bot own message
  if (client.user?.id === message.author.id) {
    return;
  }
  const commandLogger = logger.child({
    interactionId: message.id,
    guildId: message.guildId,
    channelId: message.channelId,
    userId: message.author?.id,
    type: message.type
  });

  const userMsg = message.content

  const keys = Object.keys(manCommandsRefact) as Commands[]
  for (const key of keys) {
    const command = manCommandsRefact[key]
    const isCurrentCommand = command.triggers.some(el => userMsg.startsWith(`${MODIFIER}${el}`))
    if (isCurrentCommand) {
      const specificLogger = commandLogger.child({ command: key })
      try {
        const start = performance.now();
        specificLogger.info("Launching command")
        await command.exec(message, client, specificLogger)
        specificLogger.info({ duration: performance.now() - start }, "Finished command")
      } catch (e) {
        specificLogger.error({ err: e }, 'Command execution failed')
      }
      break
    }
  }
}
