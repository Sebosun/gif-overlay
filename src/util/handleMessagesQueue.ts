import {
  type Client,
  type Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import { constructMessage } from "../helpers/constructMessage";
import type pino from "pino";
import type { ParsedSavedMessage } from "types/Messages";
import { getChannelPath, getSavedMessages } from "@/helpers/messages";
import fs from "fs/promises";
import { watchChannelsManager } from "@/channels/watchChannels";
import { flatCall, type FlatPromise } from "types/Common";

interface QueueRecord {
  isBeingSaved: boolean;
  items: ParsedSavedMessage[];
}

type Queue = Record<string, QueueRecord>;

const queue = {} as Queue;

const MESSAGES_BEFORE_SAVE = 2;

export async function handleMessageQueue(message: OmitPartialGroupDMChannel<Message<boolean>>, client: Client<boolean>, logger: pino.Logger): FlatPromise {
  const channelId = message.channelId;

  if (client.user?.id === message.author.id) {
    return [undefined, undefined];
  }

  if (!watchChannelsManager.isWatched(channelId)) {
    return [undefined, undefined];
  }

  if (!queue[channelId]) {
    queue[channelId] = { isBeingSaved: false, items: [] };
  }

  const curQueue = queue[channelId];

  const msg = constructMessage(message);
  curQueue.items.push(msg);

  logger.info({ channelId: channelId }, "Appended message to the queue");

  if (curQueue.items.length < MESSAGES_BEFORE_SAVE || curQueue.isBeingSaved) {
    return [undefined, undefined];
  }

  curQueue.isBeingSaved = true;

  const savePath = getChannelPath(channelId);
  const [error, messages] = await getSavedMessages(channelId);
  if (error) {
    curQueue.isBeingSaved = false;
    logger.error({ channelId: channelId }, "Messages file doesn't exist, even though it should");
    return [error, undefined];
  }

  const msgToAppend = curQueue.items;
  curQueue.items = [];

  const joined = [...msgToAppend.reverse(), ...messages]

  const [writeError] = await flatCall(() => fs.writeFile(savePath, JSON.stringify(joined)));
  curQueue.isBeingSaved = false;

  if (writeError) {
    logger.error({ channelId, err: writeError }, "Failed to flush queue to file");
    return [writeError, undefined];
  }

  logger.info(
    { channelId, count: msgToAppend.length },
    "Flushed queue to file",
  );

  return [undefined, undefined];
}
