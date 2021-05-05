import CClient from "../CClient";
import interactionCommands from "../interactionCommands.json";

export default async (client: CClient) => {
  console.log(`[Ready] Logged in as ${client.user?.tag}.`);

  client.mentionPrefix = new RegExp(`^<@!?${client.user?.id}>`);

  await client.guilds.cache
    .get("638455519652085780")
    ?.commands.set(interactionCommands);
};
