// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits } from "discord.js";
import commands from "./commands/commands";
import { generateAtRandom } from "../scripts/generateAtRandom";
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

client.on(Events.MessageCreate, async (msg) => {
  if (client.user?.id === msg.author.id) {
    console.log("Same id", client.user.id, msg.author.id);
    return;
  }

  if (msg.content === ".boomer") {
    console.log("Boomer command detected");
    try {
      const firstImg = msg.attachments.at(0);
      if (!firstImg) {
        console.log("Couldnt get first img, returning...");
        return;
      }

      const url = firstImg.url;

      const response = await fetch(url);
      const buffer = Buffer.from(await response.arrayBuffer());
      const result = await combineRandomImages(buffer);
      if (!result) return;

      msg.channel.send({
        files: [{ attachment: result, name: "boomer.gif" }],
      });
    } catch (e) {
      console.error("Something went wrong...", e);
    }
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
