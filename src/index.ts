// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits } from "discord.js";
import { rawCommandsManager } from "./commandsRaw/rawCommandsManager";
import { interactionManager } from "./commands/handleManager";
import { logger } from "./logger";
import { ensureUploadFoldersExist } from "lib/files/ensureFoldersExist";
import { handleMessageQueue } from "./util/handleMessagesQueue";
import { watchChannelsManager } from "./channels/watchChannels";

async function main() {
  await ensureUploadFoldersExist()
  const token = process.env.TOKEN;

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ],
  });

  client.once(Events.ClientReady, async () => {
    logger.info({ tag: client.user?.tag, uid: client.user?.id, guildCount: client.guilds.cache.size }, 'Bot is ready and online');
    watchChannelsManager.initObserver()
  });

  client.on(Events.MessageCreate, (message) => {
    rawCommandsManager(message, client)
    handleMessageQueue(message, client, logger)
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
