import Discord from "discord.js";
import CClient from "./CClient";
import { token } from "./config.json";

const client = new CClient({
  intents: Discord.Intents.NON_PRIVILEGED,
});

client.login(token);
