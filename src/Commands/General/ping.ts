import {
  CommandInteraction,
  Message,
  MessageEmbed,
  Permissions,
  User,
} from "discord.js";
import CClient from "../../CClient";
import { CCommandType } from "../../Interfaces/CCommand.interface";

export const run = async (
  client: CClient,
  msg: Message | CommandInteraction
) => {
  let pingMsg: Message;
  let user: User;
  let ping: number;

  if (msg instanceof Message) {
    // msg is a Message
    user = msg.author;
    pingMsg = await msg.reply("Ping?");
    ping =
      (pingMsg.editedTimestamp || pingMsg.createdTimestamp) -
      (msg.editedTimestamp || msg.createdTimestamp);
  } else if (msg instanceof CommandInteraction) {
    // msg is a CommandInteraction
    user = msg.user;
    // NOTE: we cant mark this as ephemeral, we get a 404 on fetch if we try
    await msg.reply("Pong?");
    pingMsg = await msg.fetchReply();
    ping = pingMsg.createdTimestamp - msg.createdTimestamp;
  }

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
    .addField("🤖 Bot", `${ping!}ms`, true)
    .addField("🌐 Gateway", `${client.ws.ping}ms`, true)
    .setTimestamp()
    .setFooter(
      `Requested by ${user!.tag}`,
      user!.displayAvatarURL({
        dynamic: true,
        format: "png",
        size: 2048,
      }) || undefined
    );

  return pingMsg!.edit({ content: "", embed: pingEmbed });
};

export const info = {
  name: "ping",
  category: "General",
  description: "Ping, pong!",
  usage: "ping",
  requiredUserPermissions: [],
  requiredBotPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  type: CCommandType.HYBRID,
  ephemeral: false,
};
