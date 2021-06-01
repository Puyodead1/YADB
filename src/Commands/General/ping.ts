import { Permissions } from "discord.js";
import { Message, MessageEmbed } from "discord.js";
import CClient from "../../CClient";
import { CPermissionLevel } from "../../Interfaces/CInterfaces";
import CCommand from "../../lib/CCommand";

export default class extends CCommand {
  constructor(client: CClient) {
    super(client, {
      name: "ping",
      description: "Gets the bots ping",
      usage: "ping",
      category: "General",
      permissionLevel: CPermissionLevel.USER,
      requiredBotPermissions: [Permissions.FLAGS.SEND_MESSAGES],
    });
  }

  async run(msg: Message, args: string[], level: number) {
    const pingMsg = await msg.reply("Ping?");
    const ping =
      (pingMsg.editedTimestamp || pingMsg.createdTimestamp) -
      (msg.editedTimestamp || msg.createdTimestamp);

    const pingEmbed = new MessageEmbed()
      .setAuthor(
        this.client.user?.username,
        this.client.user?.displayAvatarURL({
          dynamic: true,
          format: "png",
          size: 2048,
        }) || undefined
      )
      .setColor("PURPLE")
      .setTitle("Ping")
      .addField("🤖 Bot", `${ping!}ms`, true)
      .addField("🌐 Gateway", `${this.client.ws.ping}ms`, true)
      .setTimestamp()
      .setFooter(
        `Requested by ${msg.author.tag}`,
        msg.author.displayAvatarURL({
          dynamic: true,
          format: "png",
          size: 2048,
        }) || undefined
      );

    return pingMsg.edit({ content: "", embed: pingEmbed });
  }
}
