import { exec } from "child_process";
import { Permissions } from "discord.js";
import { Message, MessageEmbed } from "discord.js";
import CClient from "../../CClient";
import { CPermissionLevel } from "../../Interfaces/CInterfaces";
import CCommand from "../../lib/CCommand";

export default class extends CCommand {
  constructor(client: CClient) {
    super(client, {
      name: "git",
      category: "General",
      description: "Gets the bots current git commit hash",
      usage: "git",
      permissionLevel: CPermissionLevel.USER,
      requiredBotPermissions: [Permissions.FLAGS.SEND_MESSAGES],
    });
  }

  getBranch() {
    return new Promise((resolve, reject) => {
      exec("git rev-parse --abbrev-ref HEAD", (err, stdout, _) => {
        if (err) reject(err);

        resolve(stdout.replace("\n", ""));
      });
    });
  }

  getCommit() {
    return new Promise((resolve, reject) => {
      exec("git rev-parse HEAD", (err, stdout, _) => {
        if (err) reject(err);

        resolve(stdout.replace("\n", ""));
      });
    });
  }

  async run(msg: Message, args: string[], level: number) {
    const commit = await this.getCommit();
    const branch = await this.getBranch();

    const embed = new MessageEmbed()
      .addField("Current Branch", branch)
      .addField("Commit", commit)
      .setTimestamp()
      .setColor("PURPLE")
      .setFooter(
        `Requested by ${msg.author.tag}`,
        msg.author.displayAvatarURL({
          dynamic: true,
          format: "png",
          size: 2048,
        })
      )
      .setAuthor(
        this.client.user?.tag,
        this.client.user?.displayAvatarURL({
          dynamic: true,
          format: "png",
          size: 2048,
        })
      );

    return msg.reply(embed);
  }
}
