import fs from "fs/promises"
import { fetchChannelMessages } from "@/util/messageFetch";
import { updateSavedMarkovs } from "./updateChannels";
import { getChannelPath, getMessagesFilePaths } from "@/helpers/messages";
import { generateSaveMarkov } from "lib/markov/markov";
import { flatCall, type FlatCatch, type FlatPromise } from "types/Common";
import type pino from "pino";
import type { Client } from "discord.js";
import { setErrorTimeout } from "./setErrorTimeout";

interface WatchChannelOpts {
  id: string
  client: Client<boolean>
  logger: pino.Logger
}

// watched channel is created whenever a .markov command is used in some particular channel
const watchedChannels: Set<string> = new Set()
const watchInProgress: Map<string, Promise<FlatCatch>> = new Map()

function getAll(): string[] {
  return watchedChannels.values().toArray()
}

function isWatched(id: string): boolean {
  return watchedChannels.has(id)
}

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

async function updateChannels(): FlatPromise {
  const [error, channels] = await getMessagesFilePaths()

  if (error) {
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

async function initObserver(): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    return
  }

  const ONE_MINUTE = 1000 * 60
  const ONE_HOUR = ONE_MINUTE * 60

  const [error] = await updateChannels()

  if (!error) {
    updateSavedMarkovs()
  }

  setInterval(async () => {
    const [error] = await updateChannels()
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
