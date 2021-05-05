import { PermissionResolvable } from "discord.js";
import { CCommandType } from "./CCommand.interface";

export default interface CCommandInfo {
  name: string;
  category: string;
  description: string;
  usage: string;
  aliases?: string[];
  requiredUserPermissions?: PermissionResolvable[];
  requiredBotPermissions?: PermissionResolvable[];
  isDev?: boolean;
  type: CCommandType;
  ephemeral?: boolean;
}
