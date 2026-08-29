import { type Client, type Message, type OmitPartialGroupDMChannel } from "discord.js";
import { boomerify } from "./boomerify";
import { pomusz } from "./pomusz";
import { effect } from "./effect";
import { markov } from "./markov";
import { logger } from "../logger";
import { tomato } from "./tomato";
import type pino from "pino";

export type ManualCommand = (
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  client: Client<boolean>,
  logger: pino.Logger,
) => Promise<void>;

// Raw commands are the ones that are parsed through peoples messages in the server
// not called with `/command`

export type Commands = "boomerify" | "pomusz" | "effect" | "markov" | "tomato";

export interface CommandDetails {
  description: string;
  exec: ManualCommand;
  name: Commands;
  triggers: string[];
}

export const MODIFIER = ".";

// TODO: Fix boomerify
// TODO: Fix effect
export const manualCommands: Record<Commands, CommandDetails> = {
  boomerify: {
    name: "boomerify",
    description: `boomerify an image. Use .boomerr for more random placements`,
    exec: boomerify,
    triggers: ["boomer", "bomer", "boomerr"],
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
  tomato: {
    name: "tomato",
    description: "throw a tomato at an image",
    exec: tomato,
    triggers: ["tomato", "tomato [amount]"],
  },
} as const;

export async function rawCommandsManager(
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  client: Client<boolean>,
): Promise<void> {
  // Our bot own message
  if (client.user?.id === message.author.id) {
    return;
  }

  const commandLogger = logger.child({
    interactionId: message.id,
    guildId: message.guildId,
    channelId: message.channelId,
    userId: message.author?.id,
    userName: message.author.username,
  });

  const userMsg = message.content;

  const keys = Object.keys(manualCommands) as Commands[];

  for (const key of keys) {
    const command = manualCommands[key];

    const isCurrentCommand = command.triggers.some((el) => userMsg.startsWith(`${MODIFIER}${el}`));

    if (isCurrentCommand) {
      const curCommandLogger = commandLogger.child({ command: key });

      try {
        const start = performance.now();
        curCommandLogger.info("Launching command");

        await command.exec(message, client, curCommandLogger);

        curCommandLogger.info({ duration: performance.now() - start }, "Finished command");

      } catch (e) {
        curCommandLogger.error({ err: e }, "Command execution failed");
      }
      break;
    }
  }
}
