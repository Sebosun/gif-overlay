import { config } from "@/config";
import { getChannelPath, getMessagesFilePaths } from "@/helpers/messages";
import { generateSaveMarkov } from "@/lib/markov/markov";
import { type FlatCatch, type FlatPromise, flatCall } from "@/types/Common";
import { fetchChannelMessages } from "@/util/messageFetch";
import type { Client } from "discord.js";
import fs from "fs/promises";
import type pino from "pino";
import { setErrorTimeout } from "./setErrorTimeout";
import { updateSavedMarkovs } from "./updateChannels";

/** Options required to begin watching a Discord channel. */
interface WatchChannelOpts {
  id: string
  client: Client<boolean>
  logger: pino.Logger
}

// watched channel is created whenever a .markov command is used in some particular channel
const watchedChannels: Set<string> = new Set()
const watchInProgress: Map<string, Promise<FlatCatch>> = new Map()

/**
 * Lists channel IDs registered in this process.
 *
 * @deprecated This method has no callers. Use `isWatched` for membership checks.
 * @returns IDs of channels currently registered for Markov updates.
 */
function getAll(): string[] {
  return watchedChannels.values().toArray()
}

/**
 * Checks whether a channel is registered for Markov updates in this process.
 *
 * @param id - Discord channel ID to check.
 * @returns Whether the channel is currently watched.
 */
function isWatched(id: string): boolean {
  return watchedChannels.has(id)
}

/**
 * Fetches a channel's messages, persists them, and generates its Markov chains.
 *
 * Concurrent requests for the same channel share the pending operation. Channels are
 * registered only after message persistence and chain generation both succeed.
 *
 * @param opts - Channel, Discord client, and logger used for initialization.
 * @returns A tuple containing an initialization error, if one occurred.
 */
async function watch(opts: WatchChannelOpts): FlatPromise {
  const { id, client, logger } = opts

  const pendingProgress = watchInProgress.get(id)
  if (pendingProgress) {
    const timeout = setErrorTimeout()
    const result = await Promise.race([pendingProgress, timeout.promise])

    timeout.clear()
    return result
  }

  if (isWatched(id)) {
    return [new Error("Channel is already being watched"), undefined]
  }

  const doWatch = async (): FlatPromise => {
    const [fetchError, fetchValue] = await fetchChannelMessages(client, id, logger)

    if (fetchError) return [fetchError, undefined]

    const savePath = getChannelPath(id)
    const [error] = await flatCall(() => fs.writeFile(savePath, JSON.stringify(fetchValue)))

    if (error) return [error, undefined]

    const textContent = fetchValue.map(el => el.content)
    const [generateError] = await generateSaveMarkov(textContent, id)

    if (generateError) return [generateError, undefined]

    watchedChannels.add(id)
    return [undefined, undefined]
  }

  const pending = doWatch().finally(() => watchInProgress.delete(id))
  watchInProgress.set(id, pending)

  return pending
}

/**
 * Restores watched channel IDs from persisted message files.
 *
 * @returns A tuple containing a persistence-read error, if one occurred.
 */
async function updateChannels(logger: pino.Logger): FlatPromise {
  const [error, channels] = await getMessagesFilePaths()

  if (error) {
    logger.error({ err: error }, "Failed to retrieve saved channels")
    return [error, undefined]
  }

  for (const channel of channels) {
    const hasVal = watchedChannels.has(channel.id)
    if (!hasVal) {
      watchedChannels.add(channel.id)
    }
  }

  return [undefined, undefined]
}

/**
 * Starts production-only restoration and periodic Markov chain regeneration.
 *
 * Persisted watched channels are restored immediately, then refreshed at the
 * configured Markov update interval. This does nothing outside production.
 *
 * @returns A promise that resolves after initial restoration is attempted.
 */
async function initObserver(logger: pino.Logger): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    return
  }

  const ONE_HOUR = config.markovUpdateIntervalMs

  const [error] = await updateChannels(logger)

  if (!error) {
    updateSavedMarkovs()
  }

  setInterval(async () => {
    const [error] = await updateChannels(logger)
    if (!error) {
      await updateSavedMarkovs()
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
