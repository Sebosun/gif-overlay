import type {
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
} from "discord.js";
import { reply } from "./reply";

type PossibleInteractions = (
  interaction: ChatInputCommandInteraction,
  client?: Client,
) => Promise<void>;

interface Command {
  data: SlashCommandBuilder;
  execute: PossibleInteractions;
}

const commands = new Map<string, Command>();
commands.set("reply", reply);

export default commands;
