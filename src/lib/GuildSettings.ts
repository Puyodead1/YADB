import type { Guild } from "discord.js";
import type CClient from "./CClient";

export default class {
  public readonly roles: { [key: string]: string[] } = {
    staff: [],
    mod: [],
    admin: [],
  };
  public readonly users: { [key: string]: string[] } = {
    staff: [],
    mod: [],
    admin: [],
  };

  constructor(public client: CClient, public guild: Guild) {}
}
