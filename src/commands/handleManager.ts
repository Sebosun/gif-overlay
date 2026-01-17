import type { CacheType, Interaction } from "discord.js";
import commands from "./commands";

export async function interactionManager(interaction: Interaction<CacheType>): Promise<void> {
  if (!interaction.isChatInputCommand()) return;

  // doing this since discord.js devs are too lazy to do typescript properly
  const client = interaction.client;
  const command = commands.get(interaction.commandName);
  if (!command) {
    console.error("Missing command...");
    await interaction.followUp({
      content: "This command couldn't be found",
      ephemeral: true,
    });
    return;
  }

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    if (!interaction.replied || !interaction.deferred) {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
      return;
    }

    await interaction.followUp({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
}
