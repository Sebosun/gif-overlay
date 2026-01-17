import { ComponentType, type Message } from "discord.js"

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

export async function getUrl(message: Message<boolean>): Promise<string> {
  let url = message.attachments.at(0)?.url ?? ""
  if (!url) {
    const options = { limit: 100 };
    const fetched = await message.channel.messages.fetch(options);
    for (const [, channelMsg] of fetched) {
      const attach = channelMsg.attachments.at(0)
      if (attach) {
        url = attach.url
        break;
      } else if (channelMsg.components.length > 0) {
        const resultUrl = getUrlFromComponent(channelMsg)
        if (resultUrl !== "") {
          url = resultUrl
          break
        }
      }
    }
  }

  return url
}
