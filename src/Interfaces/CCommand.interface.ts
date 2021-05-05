import { CommandInteraction, Message } from "discord.js";
import CClient from "../CClient";
import CCommandInfo from "./CCommandInfo.interface";

type RunFunction = (
  client: CClient,
  msg: Message | CommandInteraction,
  args: string[] | null,
  ephemeral?: boolean
) => any;

export default interface CCommand {
  run: RunFunction;
  info: CCommandInfo;
}

export enum CCommandType {
  COMMAND = 0,
  INTERACTION = 1,
  HYBRID = 2,
}
