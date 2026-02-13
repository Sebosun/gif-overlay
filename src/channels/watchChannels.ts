import { fetchChannelMessages } from "@/util/messageFetch";
import { updateSavedMarkovs } from "./updateChannels";
import { getChannelPath, getMessagesFilePaths } from "@/helpers/messages";
import type pino from "pino";
import type { Client } from "discord.js";
import fs from "fs/promises"

interface WatchChannelOpts {
  id: string
  client: Client<boolean>
  logger: pino.Logger
}

// watched channel is created whenever a .markov command is used in some particular channel
const watchedChannels: Set<string> = new Set()

function getAll(): string[] {
  return watchedChannels.values().toArray()
}

function isWatched(id: string): boolean {
  return watchedChannels.has(id)
}

async function watch(opts: WatchChannelOpts): Promise<boolean> {
  const { id, client, logger } = opts
  if (isWatched(id)) return false

  const [success, messages] = await fetchChannelMessages(client, id, logger)
  if (!success) return false

  const savePath = getChannelPath(id)
  // Wrap into a function that returns [success, messages] array
  await fs.writeFile(savePath, JSON.stringify(messages))
  // TODO: WIP come back here immediatelly

  watchedChannels.add(id)

  return true
}

async function updateChannels(): Promise<void> {
  const channels = await getMessagesFilePaths()

  for (const channel of channels) {
    const hasVal = watchedChannels.has(channel.id)
    if (!hasVal) {
      watchedChannels.add(channel.id)
    }
  }
}

function initObserver(): void {
  if (process.env.NODE_ENV !== "production") {
    return
  }

  const ONE_MINUTE = 1000 * 60
  const ONE_HOUR = ONE_MINUTE * 60

  updateChannels()
  updateSavedMarkovs()

  setInterval(() => {
    try {
      updateSavedMarkovs()
      updateChannels()
    } catch (e) {
      console.error(e)
    }
  }, ONE_HOUR)
}

export const watchChannelsManager = {
  getAll,
  isWatched,
  watch,
  updateChannels,
  initObserver
}
