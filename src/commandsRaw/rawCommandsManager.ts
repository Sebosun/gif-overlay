import { type Client, type Message, type OmitPartialGroupDMChannel } from "discord.js";
import { boomerify } from "./boomerify";
import { pomusz } from "./pomusz";
import { effect } from "./effect";

type ManualCommand = (message: OmitPartialGroupDMChannel<Message<boolean>>, client?: Client<boolean>) => Promise<void>
type Commands = "boomerify" | "pomusz" | "effect"

// TODO: add descriptions and some way to generate help message without hardcoding it
const manualCommands: Record<Commands, ManualCommand> = {
  boomerify: boomerify,
  pomusz: pomusz,
  effect: effect
} as const

export async function rawCommandsManager(message: OmitPartialGroupDMChannel<Message<boolean>>, client: Client<boolean>): Promise<void> {
  if (client.user?.id === message.author.id) {
    console.log("Same id", client.user.id, message.author.id);
    return;
  }

  const isBoomerify = message.content.startsWith('.boomer') || message.content.startsWith(".bomer")
  const isPomusz = message.content === '.pomusz'
  const isEffect = message.content.startsWith('.cute')

  if (isBoomerify) {
    manualCommands.boomerify(message)
  } else if (isPomusz) {
    manualCommands.pomusz(message)
  } else if (isEffect) {
    manualCommands.effect(message)
  }
}
