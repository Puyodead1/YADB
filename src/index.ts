if (Number(process.version.slice(1).split(".")[0]) < 14)
  throw new Error(
    "Node 14.0.0 or higher is required. Update Node on your system."
  );

import CClient from "./CClient";
import config from "./config.js";
import DiscordButtons from "discord-buttons";

const client = new CClient(config);
DiscordButtons(client);

client.on("ready", () => {
  if (!client.user) {
    console.error(`[Error] No ClientUser!`);
    client.destroy();
    process.exit(1);
  }
  console.log(`[Discord] Ready! Logged in as ${client.user.tag}.`);

  // inital redis caching
  const q = client.redisClient.multi();

  client.users.cache.forEach((user) => {
    q.sadd(
      `users.${user.id}`,
      JSON.stringify({
        id: user.id,
        data: client.encryptData(user.toJSON()),
      })
    );
    q.expire(`users.${user.id}`, config.redisTTL);
  });

  client.guilds.cache.forEach((guild) => {
    q.sadd(
      `guilds.${guild.id}`,
      JSON.stringify({
        id: guild.id,
        data: client.encryptData(guild.toJSON()),
      })
    );
    q.expire(`guilds.${guild.id}`, config.redisTTL);
  });

  client.emojis.cache.forEach((emoji) => {
    q.sadd(
      `emojis.${emoji.id}`,
      JSON.stringify({
        id: emoji.id,
        data: client.encryptData(emoji.toJSON()),
      })
    );
    q.expire(`emojis.${emoji.id}`, config.redisTTL);
  });

  client.channels.cache.forEach((channel) => {
    q.sadd(
      `channels.${channel.id}`,
      JSON.stringify({
        id: channel.id,
        data: client.encryptData(channel.toJSON()),
      })
    );
    q.expire(`channels.${channel.id}`, config.redisTTL);
  });

  q.exec((err, _) => {
    if (err) throw err;
  });
});

client.on("redisReady", () => {
  console.log("[Redis] Ready!");
});

// when we recieve the ready event from redis, login to discord
// this way we know we have redis
client.redisClient.once("ready", () => {
  console.log(`[Redis] Ready!`);
  client.login(config.discordToken);
});

client.redisClient.on("error", (err) => {
  console.error(`[Redis] Error: ${err}`);
});
