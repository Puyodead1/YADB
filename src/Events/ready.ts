import CClient from "../CClient";

export default (client: CClient) => {
  console.log(`[Ready] Logged in as ${client.user?.tag}.`);

  client.mentionPrefix = new RegExp(`^<@!?${client.user?.id}>`);
};
