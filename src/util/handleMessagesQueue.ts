import {
  type Client,
  type Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import { constructMessage } from "../helpers/constructMessage";
import { watchedChannels } from "@/updateChannels";
import type pino from "pino";
import type { ParsedSavedMessage } from "types/Messages";
import { getChannelPath, getSavedMessages } from "@/helpers/messages";
import fs from "fs/promises";

interface QueueRecord {
  isBeingSaved: boolean;
  items: ParsedSavedMessage[];
}

type Queue = Record<string, QueueRecord>;

const queue = {} as Queue;

const MESSAGES_BEFORE_SAVE = 10;

export async function handleMessageQueue(
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  client: Client<boolean>,
  logger: pino.Logger,
): Promise<void> {
  const channelId = message.channelId;

  if (client.user?.id === message.author.id) {
    return;
  }
  if (!watchedChannels.has(channelId)) {
    return;
  }

  if (!queue[channelId]) {
    queue[channelId] = { isBeingSaved: false, items: [] };
  }

  logger.info({ channelId: channelId }, "Saving a sent message");

  const curQueue = queue[channelId];

  const msg = constructMessage(message);
  curQueue.items.push(msg);

  logger.info({ channelId: channelId }, "Appended message to the queue");

  if (curQueue.items.length < MESSAGES_BEFORE_SAVE || curQueue.isBeingSaved) {
    return;
  }

  curQueue.isBeingSaved = true;

  const savePath = getChannelPath(channelId);
  const [exists, messages] = await getSavedMessages(channelId);
  if (!exists) {
    const errMsg = "Messages file does exist, even though it should";
    logger.error({ channelId: channelId }, errMsg);
    throw new Error(errMsg);
  }

  const msgToAppend = curQueue.items;
  curQueue.items = [];

  const joined = messages.splice(0, 0, ...msgToAppend.reverse());

  await fs.writeFile(savePath, JSON.stringify(joined));
  curQueue.isBeingSaved = false;
  logger.info(
    { channelId, count: msgToAppend.length },
    "Flushed queue to file",
  );
}
