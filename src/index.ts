if (Number(process.version.slice(1).split(".")[0]) < 16)
  throw new Error("Node 16 or higher is required!");

import CClient from "./lib/CClient";
import { config } from "./config.js";

const client = new CClient(config);

client.on("redisReady", () => {
  console.log("[Redis] Ready!");
});

// when we recieve the ready event from redis, login to discord
// this way we know we have redis
client.redisClient.once("ready", async () => {
  console.log(`[Redis] Ready!`);
  await client.login(config.discordToken);
});

client.redisClient.on("error", (err) => {
  console.error(`[Redis] Error: ${err}`);
});
