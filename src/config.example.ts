import { Intents, Message } from "discord.js";
import { CClientOptions } from "./Interfaces/CInterfaces";

const config: CClientOptions = {
  discordToken: "bot token",
  clientId: "bot id",
  clientSecret: "bot secret",
  owners: [],
  redisOptions: {
    host: "127.0.0.1",
  },
  redisTTL: 2.592e9, // 30 days
  discordOptions: {
    intents: Intents.NON_PRIVILEGED,
  },
  defaults: {
    prefix: "..",
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
        return (
          member.roles.cache.some((r) =>
            guild.settings.roles.staff.includes(r.id)
          ) || guild.settings.users.staff.includes(member.id)
        );
      },
    },
    {
      level: 4,
      name: "Bot Mod",
      check: ({ guild, member }: Message) => {
        if (!guild || !member) return false;
        return (
          member.roles.cache.some((r) =>
            guild.settings.roles.mod.includes(r.id)
          ) || guild.settings.users.mod.includes(member.id)
        );
      },
    },
    {
      level: 5,
      name: "Guild Mod",
      check: ({ guild, member }: Message) => {
        if (!guild || !member) return false;
        return (
          member.roles.cache.some((r) =>
            guild.settings.roles.mod.includes(r.id)
          ) ||
          guild.settings.users.mod.includes(member.id) ||
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
        return (
          member.roles.cache.some((r) =>
            guild.settings.roles.admin.includes(r.id)
          ) ||
          guild.settings.users.admin.includes(member.id) ||
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
        return member.id === guild.ownerID;
      },
    },
    {
      level: 10,
      name: "Bot Owner",
      check: ({ author, client }: Message) => {
        return client.owners.includes(author.id);
      },
    },
  ],
};

export default config;
