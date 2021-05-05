import Discord from "discord.js";
import CClient, { CClientOptions } from "./CClient";
import { token, clientId, clientSecret, redis } from "./config.json";

const config: CClientOptions = {
  discord: {
    clientId,
    clientSecret,
    intents: Discord.Intents.NON_PRIVILEGED,
  },
  redis: {
    host: redis.host,
  },
};

const client = new CClient(config);

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
    q.expire(`users.${user.id}`, redis.ttl);
  });

  client.guilds.cache.forEach((guild) => {
    q.sadd(
      `guilds.${guild.id}`,
      JSON.stringify({
        id: guild.id,
        data: client.encryptData(guild.toJSON()),
      })
    );
    q.expire(`guilds.${guild.id}`, redis.ttl);
  });

  client.emojis.cache.forEach((emoji) => {
    q.sadd(
      `emojis.${emoji.id}`,
      JSON.stringify({
        id: emoji.id,
        data: client.encryptData(emoji.toJSON()),
      })
    );
    q.expire(`emojis.${emoji.id}`, redis.ttl);
  });

  client.channels.cache.forEach((channel) => {
    q.sadd(
      `channels.${channel.id}`,
      JSON.stringify({
        id: channel.id,
        data: client.encryptData(channel.toJSON()),
      })
    );
    q.expire(`channels.${channel.id}`, redis.ttl);
  });

  q.exec((err, reply) => {
    if (err) throw err;
    console.log(reply);
  });
});

client.on("redisReady", () => {
  console.log("[Redis] Ready!");
});

// when we recieve the ready event from redis, login to discord
// this way we know we have redis
client.redisClient.once("ready", () => {
  console.log(`[Redis] Ready!`);
  client.login(token);
});

client.redisClient.on("error", (err) => {
  console.error(`[Redis] Error: ${err}`);
});
