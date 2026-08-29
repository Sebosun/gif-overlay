import { ComponentType, Embed, type Message } from "discord.js"
import { config } from "@/config"

/**
 * Gets the URL from the last media-gallery item in container components on a message.
 *
 * @param message - Discord message whose container components are inspected.
 * @returns The last media-gallery URL found, or an empty string when none exists.
 */
export function getUrlFromComponent(message: Message<boolean>): string {
  let url = ""
  for (const [, actionRow] of message.components.entries()) {

    if (actionRow.type === ComponentType.Container) {
      for (const el of actionRow.components) {
        if (el.type === ComponentType.MediaGallery) {
          el.items.find(el => {
            url = el.media.data.url
          })
        }
      }
    }
  }

  return url
}

/**
 * Gets the last available video or thumbnail proxy URL from a message's embeds.
 *
 * Video URLs take precedence over thumbnails within the same embed. Later embeds
 * replace URLs found in earlier embeds.
 *
 * @param embeds - Embeds to inspect for media proxy URLs.
 * @returns The last matching proxy URL, or an empty string when none exists.
 */
export function getUrlFromEmbed(embeds: Embed[]): string {
  let url = ""

  for (const el of embeds) {
    if (el.video && el.video.proxyURL) {
      url = el.video.proxyURL
    } else if (el.thumbnail?.proxyURL) {
      url = el.thumbnail.proxyURL
    }
  }

  return url
}

/**
 * Resolves media from the message referenced by a reply.
 *
 * @param message - Reply message whose referenced message is inspected.
 * @returns A media URL, or an empty string when there is no accessible reference or media.
 */
async function getUrlFromReference(message: Message<boolean>): Promise<string> {
  if (!message.reference?.messageId) {
    return ""
  }

  try {
    const repliedToMessage = await message.fetchReference()
    const attachmentUrl = repliedToMessage.attachments.first()?.proxyURL
    const componentUrl = repliedToMessage.components.length > 0
      ? getUrlFromComponent(repliedToMessage)
      : ""
    const embedUrl = getUrlFromEmbed(repliedToMessage.embeds)

    return attachmentUrl || componentUrl || embedUrl
  } catch {
    // The referenced message may have been deleted or be inaccessible.
    return ""
  }
}

/**
 * Resolves media from a message or its recent channel history.
 *
 * The message's first attachment is preferred. If absent, the replied-to message is
 * inspected before recent channel messages are searched. Each fallback checks for an
 * attachment, a container media-gallery URL, or an embed media URL, in that order.
 *
 * @param message - Message that supplies the direct attachment and channel context.
 * @returns A media URL, or an empty string when no matching media is found.
 */
export async function getAttachementUrl(message: Message<boolean>): Promise<string> {
  let url = message.attachments.at(0)?.url ?? ""
  if (!url) {
    url = await getUrlFromReference(message)

    if (url) {
      return url
    }

    const options = { limit: config.messageSearchLimit };
    const fetched = await message.channel.messages.fetch(options);
    for (const [, channelMsg] of fetched) {
      const attach = channelMsg.attachments.first()?.proxyURL
      const embedUrl = getUrlFromEmbed(channelMsg.embeds)
      if (attach) {
        url = attach
        break;
      } else if (channelMsg.components.length > 0) {
        const resultUrl = getUrlFromComponent(channelMsg)
        if (resultUrl !== "") {
          url = resultUrl
          break
        }
      } else if (embedUrl) {
        url = embedUrl
        break
      }
    }
  }

  return url
}
