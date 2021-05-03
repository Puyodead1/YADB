import {
  CommandInteraction,
  Message,
  MessageEmbed,
  Permissions,
  User,
} from "discord.js";
import CClient from "../../CClient";
import { exec } from "child_process";
import { CCommandType } from "../../Interfaces/CCommand.interface";

export const run = async (
  client: CClient,
  msg: Message | CommandInteraction
) => {
  let ephemeral: boolean = false;
  let user: User;

  if (msg instanceof CommandInteraction) {
    user = msg.user;
    if (msg.options.length > 0) {
      ephemeral = Boolean(msg.options[0].value);
    }
  } else {
    user = msg.author;
  }

  const commit = await getCommit();
  const branch = await getBranch();

  const embed = new MessageEmbed()
    .addField("Current Branch", branch)
    .addField("Commit", commit)
    .setTimestamp()
    .setColor("PURPLE")
    .setFooter(
      `Requested by ${user.tag}`,
      user.displayAvatarURL({ dynamic: true, format: "png", size: 2048 })
    )
    .setAuthor(
      client.user?.tag,
      client.user?.displayAvatarURL({
        dynamic: true,
        format: "png",
        size: 2048,
      })
    );

  if (msg instanceof CommandInteraction) {
    return msg.reply("", {
      embeds: [embed],
      ephemeral: ephemeral || info.ephemeral,
    });
  } else if (msg instanceof Message) {
    return msg.reply({
      embed,
    });
  }
};

function getBranch() {
  return new Promise((resolve, reject) => {
    exec("git rev-parse --abbrev-ref HEAD", (err, stdout, _) => {
      if (err) reject(err);

      resolve(stdout.replace("\n", ""));
    });
  });
}

function getCommit() {
  return new Promise((resolve, reject) => {
    exec("git rev-parse HEAD", (err, stdout, _) => {
      if (err) reject(err);

      resolve(stdout.replace("\n", ""));
    });
  });
}

export const info = {
  name: "git",
  category: "General",
  description: "Returns git status",
  usage: "git",
  requiredUserPermissions: [],
  requiredBotPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  type: CCommandType,
  ephemeral: false,
};
