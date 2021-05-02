import { Message, MessageEmbed, Permissions } from "discord.js";
import CClient from "../../CClient";

export const run = async (client: CClient, msg: Message) => {
  const pingMsg = await msg.reply("Ping?");
  const ping =
    (pingMsg.editedTimestamp || pingMsg.createdTimestamp) -
    (msg.editedTimestamp || msg.createdTimestamp);

  const pingEmbed = new MessageEmbed()
    .setAuthor(
      client.user?.username,
      client.user?.displayAvatarURL({
        dynamic: true,
        format: "png",
        size: 2048,
      }) || undefined
    )
    .setColor("PURPLE")
    .setTitle("Ping")
    .addField("🤖 Bot", `${ping}ms`, true)
    .addField("🌐 Gateway", `${client.ws.ping}ms`, true)
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
};

export const info = {
  name: "ping",
  category: "General",
  description: "Ping, pong!",
  usage: "ping",
  requiredUserPermissions: [],
  requiredBotPermissions: [Permissions.FLAGS.SEND_MESSAGES],
};
