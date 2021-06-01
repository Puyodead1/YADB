import { Message } from "discord.js";
import CClient from "../CClient";
import { CCommandArgs } from "../Interfaces/CInterfaces";

export default class CCommand {
  client!: CClient;
  config: {
    enabled: boolean;
    guildOnly: boolean;
    aliases: string[];
    permissionLevel: number;
    requiredBotPermissions: import("discord.js").PermissionResolvable[];
    requiredUserPermissions: import("discord.js").PermissionResolvable[];
  };
  info: { name: string; description: string; category: string; usage: string };
  constructor(
    client: CClient,
    {
      name,
      description = "No description provided.",
      category,
      usage = "No usage provided.",
      enabled = true,
      guildOnly = false,
      aliases = new Array(),
      permissionLevel = 0,
      requiredBotPermissions = [],
      requiredUserPermissions = [],
    }: CCommandArgs
  ) {
    Object.defineProperty(this, "client", {
      enumerable: false,
      writable: false,
      value: client,
    });
    this.config = {
      enabled,
      guildOnly,
      aliases,
      permissionLevel,
      requiredBotPermissions,
      requiredUserPermissions,
    };
    this.info = { name, description, category, usage };
  }

  async run(msg: Message, args: string[], level: number): Promise<any> {}
}
