// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits } from "discord.js";
import { rawCommandsManager } from "./commandsRaw/rawCommandsManager";
import { interactionManager } from "./commands/handleManager";
import { logger } from "./logger";
import { ensureUploadFoldersExist } from "lib/files/ensureFoldersExist";
import { updateAllChannelMessages, updateWatchedChannels } from "./updateChannels";

async function onInit(client: Client<boolean>): Promise<void> {
  logger.info({
    tag: client.user?.tag,
    uid: client.user?.id,
    guildCount: client.guilds.cache.size
  }, 'Bot is ready and online');
  if (process.env.NODE_ENV !== "production") {
    return
  }
  const ONE_MINUTE = 1000 * 60
  const ONE_HOUR = ONE_MINUTE * 60

  updateWatchedChannels()
  updateAllChannelMessages(client)

  setInterval(() => {
    try {
      updateAllChannelMessages(client)
      updateWatchedChannels()
    } catch (e) {
      console.error(e)
    }
  }, ONE_HOUR)

}

async function main() {
  await ensureUploadFoldersExist()
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

  client.on(Events.MessageCreate, (message) => {
    rawCommandsManager(message, client)
  });

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
