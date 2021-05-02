import { PermissionResolvable } from "discord.js";

export default interface CCommandInfo {
  name: string;
  category: string;
  description: string;
  usage: string;
  aliases?: string[];
  requiredUserPermissions?: PermissionResolvable[];
  requiredBotPermissions?: PermissionResolvable[];
  isDev?: boolean;
}
