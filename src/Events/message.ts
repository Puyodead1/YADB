import { Message, PermissionResolvable } from "discord.js";
import CClient from "../CClient";
import { prefix, owners } from "../config.json";
import CCommand, { CCommandType } from "../Interfaces/CCommand.interface";

export default async (client: CClient, msg: Message) => {
  if (msg.author.bot || !msg.guild || msg.channel.type === "dm") return;

  if (client.mentionPrefix?.test(msg.content)) {
    return msg.reply(
      `My prefix for this server is currently set to: \`\`${prefix}\`\``
    );
  }

  if (!msg.content.toLowerCase().startsWith(prefix.toLowerCase())) return;

  const args = msg.content.slice(prefix.length).trim().split(/ +/g);
  const cmdName = args.shift()?.toLowerCase();

  if (!cmdName) {
    console.error(`[Message] Failed to extract command name!`);
    return msg.reply(`Failed to extract command name!`);
  }

  const cmd =
    client.commands.get(cmdName) ||
    client.commands.find((c) =>
      c.info.aliases ? c.info.aliases.includes(cmdName) : false
    );

  if (!cmd) return;

  if (cmd.info.category === "Developer" && !owners.includes(msg.author.id))
    return;

  if (cmd.info.requiredBotPermissions) {
    const missingPermissions: PermissionResolvable[] = [];
    const me = msg.guild.me;
    cmd.info.requiredBotPermissions.forEach((rp) => {
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
      cmd.info.requiredUserPermissions
        ?.map((x) => x.toString())
        .includes("DEVELOPER")
    ) {
      return owners.includes(msg.author.id);
    }
    return false;
  };

  if (cmd.info.requiredUserPermissions && !canOwnerOverride(cmd, msg)) {
    const missingPermissions: PermissionResolvable[] = [];
    cmd.info.requiredUserPermissions.forEach((rp) => {
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

  if (cmd.info.type === CCommandType.INTERACTION)
    return msg.reply(
      `That command is a slash command! Please use '/${cmd.info.name}'.`
    );

  console.log(
    `[Message] ${msg.author.tag} (${msg.author.id}) ran command '${cmdName}'.`
  );

  try {
    // result can be a boolean indictating the success or failure of a commands execution
    const result = await cmd.run(client, msg, args);
  } catch (e) {
    console.error(`[Message] Execution Failed for command '${cmdName}'!\n`, e);

    return msg.reply(
      `🐛 An error occurred while running that command. If this issue persists, please contact the developer! 🐛`
    );
  }
};
