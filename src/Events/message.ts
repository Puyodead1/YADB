import { Message, PermissionResolvable } from "discord.js";
import CClient from "../CClient";
import CCommand from "../lib/CCommand";

export default class {
  client!: CClient;
  constructor(client: CClient) {
    Object.defineProperty(this, "client", {
      writable: false,
      enumerable: false,
      value: client,
    });
  }

  async run(msg: Message) {
    if (msg.author.bot || !msg.guild || msg.channel.type === "dm") return;

    if (this.client.mentionPrefix?.test(msg.content)) {
      return msg.reply(
        `My prefix for this server is currently set to: \`\`${this.client.defaults.prefix}\`\``
      );
    }

    if (
      !msg.content
        .toLowerCase()
        .startsWith(this.client.defaults.prefix.toLowerCase())
    )
      return;

    const args = msg.content
      .slice(this.client.defaults.prefix.length)
      .trim()
      .split(/ +/g);
    const cmdName = args.shift()?.toLowerCase();

    if (!cmdName) {
      console.error(`[Message] Failed to extract command name!`);
      return msg.reply(`Failed to extract command name!`);
    }

    if (msg.guild && !msg.member) await msg.guild.members.fetch(msg.author);

    const level = this.client.getPermissionLevel(msg);
    if (!level)
      return console.error(
        `[Message] Failed to get permission level for user ${msg.author.tag} (${msg.author.id}) in guild ${msg.guild.name} (${msg.guild.id})`
      );

    const cmd =
      this.client.commands.get(cmdName) ||
      this.client.commands.find((c) =>
        c.config.aliases ? c.config.aliases.includes(cmdName) : false
      );

    if (!cmd)
      return console.warn(`[Message] Command was undefined: ${cmdName}`);

    if (!msg.guild && cmd.config.guildOnly)
      return msg.channel.send(
        "This command is unavailable via private message. Please run this command in a guild."
      );

    //if (level < this.client.permLevelCache[cmd.config.permissionLevel]) return;
    if (level < cmd.config.permissionLevel)
      return console.warn(
        `[Message] Command Execution Blocked: ${msg.author.tag} (${
          msg.author.id
        }) tried to run the command '${cmdName}' but doesn't have the required permission!\nPermission Level: ${level} (${
          this.client.permissionLevels.find((x) => x.level === level)?.name
        })\nRequired Permission Level: ${cmd.config.permissionLevel} (${
          this.client.permissionLevels.find(
            (x) => x.level === cmd.config.permissionLevel
          )?.name
        })`
      );

    // if (
    //   cmd.info.category === "Developer" &&
    //   !this.client.owners.includes(msg.author.id)
    // )
    //   return;

    if (cmd.config.requiredBotPermissions) {
      const missingPermissions: PermissionResolvable[] = [];
      const me = msg.guild.me;
      cmd.config.requiredBotPermissions.forEach((rp) => {
        if (!me?.permissions.has(rp, true)) missingPermissions.push(rp);
      });

      if (missingPermissions.length > 0) {
        return msg.reply(
          `I am missing the following permissions: \`\`${missingPermissions.join(
            ", "
          )}\`\``
        );
      }
    }

    const canOwnerOverride = (cmd: CCommand, msg: Message) => {
      if (
        cmd.config.requiredUserPermissions
          ?.map((x) => x.toString())
          .includes("DEVELOPER")
      ) {
        return this.client.owners.includes(msg.author.id);
      }
      return false;
    };

    if (cmd.config.requiredUserPermissions && !canOwnerOverride(cmd, msg)) {
      const missingPermissions: PermissionResolvable[] = [];
      cmd.config.requiredUserPermissions.forEach((rp) => {
        if (!msg.member?.permissions.has(rp) && rp.toString() !== "developer")
          missingPermissions.push(rp);
      });

      if (missingPermissions.length > 0) {
        console.log(
          `[Message] Command Execution Blocked: ${msg.author.tag} (${
            msg.author.id
          }) tried to run the command '${cmdName}' but was missing the following permissions: ${missingPermissions.join(
            ", "
          )}`
        );

        return msg.reply(
          `You are missing the following permissions: \`\`${missingPermissions.join(
            ", "
          )}\`\``
        );
      }
    }

    console.log(
      `[Message] ${msg.author.tag} (${msg.author.id}) ran command '${cmdName}'.`
    );

    try {
      // result can be a boolean indictating the success or failure of a commands execution
      const result = await cmd.run(msg, args, 0);
    } catch (e) {
      console.error(
        `[Message] Execution Failed for command '${cmdName}'!\n`,
        e
      );

      return msg.reply(
        `🐛 An error occurred while running that command. If this issue persists, please contact the developer! 🐛`
      );
    }
  }
}
