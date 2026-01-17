// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits } from "discord.js";
import commands from "./commands/commands";
import { combineRandomImages } from "../lib/combineRandomImages";

const token = process.env.token;
// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {

  if (client.user?.id === message.author.id) {
    console.log("Same id", client.user.id, message.author.id);
    return;
  }

  const isBoomerify = message.content.startsWith('.boomer') || message.content.startsWith(".bomer")
  const isPomusz = message.content === '.pomusz'

  if (isBoomerify) {
    const isRandom = message.content === ".boomerr" || message.content === '.bomerr'
    console.log("Boomer command detected");
    try {
      let firstImg = message.attachments.at(0);
      if (!firstImg) {
        const options = { limit: 100 };
        const fetched = await message.channel.messages.fetch(options);
        for (const [, channelMsg] of fetched) {
          if (channelMsg.attachments.at(0)) {
            firstImg = channelMsg.attachments.at(0);
            break;
          }
        }
      }

      if (!firstImg) {
        console.log("No messages found");
        return;
      }

      const url = firstImg.url;

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

});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // doing this since discord.js devs are too lazy to do typescript properly
  const client = interaction.client;
  const command = commands.get(interaction.commandName);
  if (!command) {
    console.error("Missing command...");
    await interaction.followUp({
      content: "There was an error while executing this command!",
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
});

// Log in to Discord with your client's token
client.login(token);
