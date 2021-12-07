import type {
  ClientOptions as DiscordClientOptions,
  Message,
} from "discord.js";
import type { RedisOptions as RedisClientOptions } from "ioredis";
import type { CipherCCMOptions } from "crypto";

export interface CClientOptions {
  discordOptions: DiscordClientOptions;
  redisOptions?: RedisClientOptions;
  redisTTL: number;
  encryptionOptions?: CipherCCMOptions;
  clientId: string;
  clientSecret: string;
  discordToken: string;
  permissionLevels: CPermissionLevels[];
}

export interface CPermissionLevels {
  level: number;
  name: string;
  check: (message: Message) => boolean | null | Promise<boolean | null>;
}
export enum CPermissionLevel {
  USER = 0,
  BOT_STAFF = 3,
  BOT_MOD = 4,
  GUILD_MOD = 5,
  ADMIN = 6,
  GUILD_OWNER = 7,
  BOT_OWNER = 10,
}
