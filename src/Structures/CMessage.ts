import {
  Structures,
  Client,
  TextChannel,
  DMChannel,
  NewsChannel,
} from "discord.js";
import CClient from "../CClient";

export default class CMessage extends Structures.get("Message") {
  constructor(
    client: Client,
    data: any,
    channel: TextChannel | DMChannel | NewsChannel
  ) {
    super(client, data, channel);
  }
}

declare module "discord.js" {
  export interface Message {
    client: CClient;
  }
}

Structures.extend("Message", () => CMessage);
