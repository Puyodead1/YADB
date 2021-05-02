import { Message } from "discord.js";
import CClient from "../CClient";
import CCommandInfo from "./CCommandInfo.interface";

type RunFunction = (client: CClient, msg: Message, args: string[]) => any;

export default interface CCommand {
  run: RunFunction;
  info: CCommandInfo;
}
