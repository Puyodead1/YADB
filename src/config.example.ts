import { LogLevel } from "@sapphire/framework";
import type { Message } from "discord.js";
import type { CClientOptions } from "./Interfaces/CInterfaces";

const config: CClientOptions = {
  discordToken: "a",
  clientId: "a",
  clientSecret: "a",
  redisOptions: {
    host: "a",
    password: "",
  },
  redisTTL: 2.592e9, // 30 days
  discordOptions: {
    intents: 32767,
    logger: {
      level: LogLevel.Debug,
    },
    shards: "auto",
    enableLoaderTraceLoggings: true,
    loadDefaultErrorListeners: true,
  },
  permissionLevels: [
    {
      level: 0,
      name: "User",
      check: () => true,
    },
    {
      level: 3,
      name: "Bot Staff",
      check: ({ guild, member }: Message) => {
        if (!guild || !member) return false;
        const guildSettings = guild.client.guildSettings.get(guild.id);
        if (!guildSettings) return false;
        return (
          member.roles.cache.some((r) =>
            guildSettings.roles.staff.includes(r.id)
          ) || guildSettings.users.staff.includes(member.id)
        );
      },
    },
    {
      level: 4,
      name: "Bot Mod",
      check: ({ guild, member }: Message) => {
        if (!guild || !member) return false;
        const guildSettings = guild.client.guildSettings.get(guild.id);
        if (!guildSettings) return false;
        return (
          member.roles.cache.some((r) =>
            guildSettings.roles.mod.includes(r.id)
          ) || guildSettings.users.mod.includes(member.id)
        );
      },
    },
    {
      level: 5,
      name: "Guild Mod",
      check: ({ guild, member }: Message) => {
        if (!guild || !member) return false;
        const guildSettings = guild.client.guildSettings.get(guild.id);
        if (!guildSettings) return false;
        return (
          member.roles.cache.some((r) =>
            guildSettings.roles.mod.includes(r.id)
          ) ||
          guildSettings.users.mod.includes(member.id) ||
          (member.permissions.has("BAN_MEMBERS") &&
            member.permissions.has("KICK_MEMBERS"))
        );
      },
    },
    {
      level: 6,
      name: "Admin",
      check: ({ guild, member }: Message) => {
        if (!guild || !member) return false;
        const guildSettings = guild.client.guildSettings.get(guild.id);
        if (!guildSettings) return false;
        return (
          member.roles.cache.some((r) =>
            guildSettings.roles.admin.includes(r.id)
          ) ||
          guildSettings.users.admin.includes(member.id) ||
          (member.permissions.has("ADMINISTRATOR") &&
            member.permissions.has("MANAGE_GUILD"))
        );
      },
    },
    {
      level: 7,
      name: "Guild Owner",
      check: ({ guild, member }: Message) => {
        if (!guild || !member) return false;
        return member.id === guild.ownerId;
      },
    },
    // {
    //   level: 10,
    //   name: "Bot Owner",
    //   check: ({ author, client }: Message) => {
    //     return client.owners.includes(author.id);
    //   },
    // },
  ],
};

export default config;
