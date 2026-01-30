// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits } from "discord.js";
import { rawCommandsManager } from "./commandsRaw/rawCommandsManager";
import { interactionManager } from "./commands/handleManager";
import fs from "fs/promises"
import path from "path";
import { updateChannelMessages } from "./util/messageFetch";
import { logger } from "./logger";
import { generateAndSave } from "../lib/markov";
import { ensureUploadFoldersExist, ensureUserFolderExists } from "lib/ensureFoldersExist";

const watchedChannels: Set<string> = new Set()

async function getMessagesChannels() {
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

  return channelFiles
}

async function updateAllChannelMessages(client: Client<boolean>) {
  const channelFiles = await getMessagesChannels()

  for (const channel of channelFiles) {
    // TODO: some sleep here 
    const channelLogger = logger.child({ channel: channel })
    const start = performance.now()

    channelLogger.info("Starting saving channel msgs and parsing markov")
    const [success, messages] = await updateChannelMessages(client, channel.id, channelLogger)
    if (success) {
      const messageAsText = messages.map(el => el.content)
      await generateAndSave(messageAsText, channel.id)
    }
    channelLogger.info({ duration: performance.now() - start, wasFetchSuccess: success }, "Ended saving channel msgs and parsing markov")
  }
}

async function updateWatchedChannels(): Promise<void> {
  const channels = await getMessagesChannels()

  const channelsIds = channels.map(el => el.path.split('.')[0] ?? 'INVALID')

  for (const channel of channelsIds) {
    const hasVal = watchedChannels.has(channel)
    if (!hasVal) {
      watchedChannels.add(channel)
    }
  }

}


async function onInit(client: Client<boolean>) {
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
  logger.info({
    tag: client.user?.tag,
    uid: client.user?.id,
    guildCount: client.guilds.cache.size
  }, 'Bot is ready and online');
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
