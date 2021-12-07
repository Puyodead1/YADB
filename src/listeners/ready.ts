import { Listener, ListenerOptions, PieceContext } from "@sapphire/framework";
import { config } from "../config";

export class UserEvent extends Listener {
  constructor(context: PieceContext, options?: ListenerOptions) {
    super(context, {
      ...options,
      once: true,
    });
  }

  public async run() {
    if (!this.container.client.user) {
      console.error(`[Error] No ClientUser!`);
      this.container.client.destroy();
      process.exit(1);
    }
    console.log(
      `[Discord] Ready! Logged in as ${this.container.client.user.tag}.`
    );

    // inital redis caching
    const q = this.container.client.redisClient.multi();

    this.container.client.users.cache.forEach((user) => {
      q.sadd(
        `users.${user.id}`,
        JSON.stringify({
          id: user.id,
          data: this.container.client.encryptData(user.toJSON()),
        })
      );
      q.expire(`users.${user.id}`, config.redisTTL);
    });

    this.container.client.guilds.cache.forEach((guild) => {
      q.sadd(
        `guilds.${guild.id}`,
        JSON.stringify({
          id: guild.id,
          data: this.container.client.encryptData(guild.toJSON()),
        })
      );
      q.expire(`guilds.${guild.id}`, config.redisTTL);
    });

    this.container.client.emojis.cache.forEach((emoji) => {
      q.sadd(
        `emojis.${emoji.id}`,
        JSON.stringify({
          id: emoji.id,
          data: this.container.client.encryptData(emoji.toJSON()),
        })
      );
      q.expire(`emojis.${emoji.id}`, config.redisTTL);
    });

    this.container.client.channels.cache.forEach((channel) => {
      q.sadd(
        `channels.${channel.id}`,
        JSON.stringify({
          id: channel.id,
          data: this.container.client.encryptData(channel.toJSON()),
        })
      );
      q.expire(`channels.${channel.id}`, config.redisTTL);
    });

    q.exec((err, _) => {
      if (err) throw err;
    });
  }
}
