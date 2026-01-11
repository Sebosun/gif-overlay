import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const reply = {
  data: new SlashCommandBuilder()
    .setName("reply")
    .setDescription("Replies to user"),
  async execute(interaction: ChatInputCommandInteraction) {
    // interaction.user is the object representing the User who ran the command
    // interaction.member is the GuildMember object, which represents the user in the specific guild
    await interaction.reply("Twoj stary jebie gary hahahahah");
  },
};
