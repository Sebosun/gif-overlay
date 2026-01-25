// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits } from "discord.js";
import { rawCommandsManager } from "./commandsRaw/rawCommandsManager";
import { interactionManager } from "./commands/handleManager";
import fs from "fs/promises"
import path from "path";
import { updateChannelMessages } from "./util/messageFetch";
import { logger } from "./logger";

async function updateAllChannelMessages(client: Client<boolean>) {
  const projectRoot = process.cwd();
  const messagesPath = path.join(projectRoot, "assets", "messages")

  const messageFiles = await fs.readdir(messagesPath)
  const jsonFiles = messageFiles.filter(el => el.endsWith('.json'))
  const channelFiles = jsonFiles.map(el => {
    const filePath = path.join(messagesPath, el)
    const id = el.split('.').at(0) ?? ""
    return {
      id: id,
      path: filePath
    }
  })

  for (const channel of channelFiles) {
    // TODO: some sleep here 
    const channelLogger = logger.child({ channel: channel })
    await updateChannelMessages(client, channel.id, channelLogger)
  }
}

const ONE_MINUTE = 1000 * 60

async function onInit(client: Client<boolean>) {
  logger.info({
    tag: client.user?.tag,
    uid: client.user?.id,
    guildCount: client.guilds.cache.size
  }, 'Bot is ready and online');

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
  const token = process.env.TOKEN;
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

  client.on(Events.Error, (error) => {
    logger.error({ error: error }, "Discord Client Error")
  });
  client.on(Events.Warn, (info) => {
    logger.warn({ info: info }, "Discord Client Warning")
  });

  client.login(token);
}

main()
