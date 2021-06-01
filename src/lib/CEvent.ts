import { Message } from "discord.js";
import CClient from "../CClient";

export default class CEvent {
  client!: CClient;
  constructor(client: CClient) {
    Object.defineProperty(this, "client", {
      enumerable: false,
      writable: false,
      value: client,
    });
  }

  async run(...args: any[]): Promise<any> {}
}
