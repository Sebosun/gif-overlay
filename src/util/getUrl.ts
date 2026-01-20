import { ComponentType, Embed, type Message } from "discord.js"

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

export async function getUrl(message: Message<boolean>): Promise<string> {
  let url = message.attachments.at(0)?.url ?? ""
  if (!url) {
    const options = { limit: 50 };
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
