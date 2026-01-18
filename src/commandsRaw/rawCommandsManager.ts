import { type Client, type Message, type OmitPartialGroupDMChannel } from "discord.js";
import { boomerify } from "./boomerify";
import { pomusz } from "./pomusz";

type ManualCommand = (message: OmitPartialGroupDMChannel<Message<boolean>>, client?: Client<boolean>) => Promise<void>
type Commands = "boomerify" | "pomusz"

const manualCommands: Record<Commands, ManualCommand> = {
  boomerify: boomerify,
  pomusz: pomusz
}

export async function rawCommandsManager(message: OmitPartialGroupDMChannel<Message<boolean>>, client: Client<boolean>): Promise<void> {
  if (client.user?.id === message.author.id) {
    console.log("Same id", client.user.id, message.author.id);
    return;
  }

  const isBoomerify = message.content.startsWith('.boomer') || message.content.startsWith(".bomer")
  const isPomusz = message.content === '.pomusz'

  if (isBoomerify) {
    manualCommands.boomerify(message)
  } else if (isPomusz) {
    manualCommands.pomusz(message)
  }

}
