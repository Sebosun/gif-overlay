// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits } from "discord.js";
import { rawCommandsManager } from "./commandsRaw/rawCommandsManager";
import { interactionManager } from "./commands/handleManager";

const token = process.env.token;
// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, (message) => rawCommandsManager(message, client));
client.on(Events.InteractionCreate, interactionManager);

client.login(token);
