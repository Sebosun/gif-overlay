// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits } from "discord.js";
import { rawCommandsManager } from "./commandsRaw/rawCommandsManager";
import { interactionManager } from "./commands/handleManager";
import fs from "fs/promises"
import path from "path";
import { updateChannelMessages } from "./util/messageFetch";

async function updateAllChannelMessages(client: Client<boolean>) {
  const projectRoot = process.cwd();
  const messagesPath = path.join(projectRoot, "assets", "messages")

  const messageFiles = await fs.readdir(messagesPath)
  const jsonFiles = messageFiles.filter(el => el.endsWith('.json'))
  const channelFiles = jsonFiles.map(el => {
    const filePath = path.join(messagesPath, el)
    const name = el.split('.').at(0) ?? ""
    return {
      name: name,
      path: filePath
    }
  })

  for (const channel of channelFiles) {
    // TODO: some sleep here 
    await updateChannelMessages(client, channel.name)
  }
}

const ONE_MINUTE = 1000 * 60

async function onInit(client: Client<boolean>) {
  console.log(`Client ready at ${client.user?.username}`)
  const ONE_HOUR = ONE_MINUTE * 60

  updateAllChannelMessages(client)
  setInterval(() => {
    try {
      updateAllChannelMessages(client)
    } catch (e) {
      console.error(e)
    }
  }, ONE_HOUR)
}

async function main() {
  const token = process.env.token;
  // Create a new client instance
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ],
  });

  client.once(Events.ClientReady, async (clientReady) => {
    onInit(clientReady)
  });

  client.on(Events.MessageCreate, (message) => rawCommandsManager(message, client));
  client.on(Events.InteractionCreate, interactionManager);

  client.login(token);
}

main()
