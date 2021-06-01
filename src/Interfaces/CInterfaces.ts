import {
  PermissionResolvable,
  UserResolvable,
  ClientOptions as DiscordClientOptions,
  Message,
} from "discord.js";
import { ClientOpts as RedisClientOptions } from "redis";
import { CipherCCMOptions } from "crypto";

export interface CCommandArgs {
  name: string;
  description: string;
  category: string;
  usage?: string;
  enabled?: boolean;
  guildOnly?: boolean;
  aliases?: string[];
  permissionLevel?: number;
  requiredBotPermissions?: PermissionResolvable[];
  requiredUserPermissions?: PermissionResolvable[];
}

export interface CGuildSettingsMessages {
  leave: string;
  join: string;
  membersVoiceStats: string;
  botsVoiceStats: string;
  usersVoiceStats: string;
  channelsVoiceStats: string;
  rolesVoiceStats: string;
}

export interface CGuildSettingsQueue {
  songs: any[];
  playing: boolean;
  /**
   * voice channel
   */
  voice?: string;
  /**
   * text channel
   */
  channel?: string;
  volume: number;
  loop?: string;
  voteSkip: any[];
  locked: boolean;
  bass?: string;
  shuffle: boolean;
  summoned: boolean;
  player?: any;
  playerJson?: any;
  parties: any[];
}

export interface CGuildSettingsLevels {
  enabled: boolean;
  message: string;
  levelRoles: any[];
  embed: boolean;
  multiplier: number;
  announce: string;
}

export interface CGuildSettingsMusic {
  enabled: boolean;
  announce: boolean;
  djOnly: boolean;
  /**
   * array of roles
   */
  djRoles: string[];
  djBulkQueue: boolean;
  preventDupes: boolean;
  volume: number;
  maxUserSongs?: number;
  parties: boolean;
}

export interface CGuildSettingsAutoModLinks {
  enabled: boolean;
  strict: boolean;
  overrides: string[];
}

export interface CGuildSettingsAutoModEmojis {
  enabled: boolean;
  max: number;
}

export interface CGuildSettingsAutoModMentions {
  enabled: boolean;
  max: number;
}

export interface CGuildSettingsAutoModOverrides {
  /**
   * array of roles
   */
  roles: string[];
  /**
   * array of channels
   */
  channels: string[];
}

export interface CGuildSettingsAutoMod {
  invites: boolean;
  links: CGuildSettingsAutoModLinks;
  emojis: CGuildSettingsAutoModEmojis;
  mentions: CGuildSettingsAutoModMentions;
  caps: boolean;
  bannedWords: string[];
  nsfw: boolean;
  overrides: CGuildSettingsAutoModOverrides;
  ignoreMods: boolean;
}

export interface CGuildSettingsChannelsLogging {
  /**
   * text channel
   */
  modLogs?: string;
  /**
   * text channel
   */
  raidAlerts?: string;
  /**
   * text channel
   */
  memberLogs?: string;
  /**
   * text channel
   */
  channelChanges?: string;
  /**
   * text channel
   */
  censoredMessages?: string;
  /**
   * text channel
   */
  roleChanges?: string;
  /**
   * text channel
   */
  userUpdates?: string;
  /**
   * text channel
   */
  voiceChanges?: string;
  /**
   * text channel
   */
  misc?: string;
  /**
   * text channel
   */
  messageLogs?: string;
  /**
   * text channel
   */
  spamLogs?: string;
}

export interface CGuildSettingsChannels {
  logging: CGuildSettingsChannelsLogging;
  /**
   * array of text channels
   */
  noXP: string[];
  /**
   * voice channel
   */
  memberVoiceStats?: string;
  /**
   * voice channel
   */
  botsVoiceStats?: string;
  /**
   * voice channel
   */
  usersVoiceStats?: string;
  /**
   * voice channel
   */
  channelsVoiceStats?: string;
  /**
   * voice channel
   */
  rolesVoiceStats?: string;
}

export interface CGuildSettingsTogglesLogging {
  modLogs: boolean;
  raidAlerts: boolean;
  memberLogs: boolean;
  channelChanges: boolean;
  censoredMessages: boolean;
  roleChanges: boolean;
  userUpdates: boolean;
  voiceChanges: boolean;
  misc: boolean;
  messageEdits: boolean;
  messageDelete: boolean;
  messageBulkDelete: boolean;
  spamLogs: boolean;
  ignoreBots: boolean;
}

export interface CGuildSettingsToggles {
  autoRoles: boolean;
  staffBypass: boolean;
  selfRoles: boolean;
  afk: boolean;
  reactionRoles: boolean;
  logging: CGuildSettingsTogglesLogging;
}

export interface CGuildSettingsUsers {
  /**
   * user array
   */
  admin: string[];
  /**
   * user array
   */
  mod: string[];
  /**
   * user array
   */
  staff: string[];
}

export interface CGuildSettingsRoles {
  /**
   * array of roles
   */
  autoRoles: string[];
  /**
   * array of roles
   */
  selfRoles: string[];
  /**
   * array of roles
   */
  admin: string[];
  /**
   * array of roles
   */
  mod: string[];
  /**
   * array of roles
   */
  staff: string[];
  /**
   * role
   */
  muted?: string;
  /**
   * array of roles
   */
  noXP: string[];
}

export interface CGuildSettingsModerationStrikesPunishmentsThresholds {
  mute: number;
  ban: number;
  tempMute: number;
  tempBan: number;
}

export interface CGuildSettingsModerationStrikesPunishmentsDurations {
  mute: number;
  ban: number;
}

export interface CGuildSettingsModerationStrikesPunishments {
  thresholds: CGuildSettingsModerationStrikesPunishmentsThresholds;
  durations: CGuildSettingsModerationStrikesPunishmentsDurations;
}

export interface CGuildSettingsModerationStrikes {
  punishments: CGuildSettingsModerationStrikesPunishments;
}

export interface CGuildSettingsModeration {
  strikes: CGuildSettingsModerationStrikes;
}

export interface CGuildSettings {
  tags: any[];
  messages: CGuildSettingsMessages;
  modLogs: any[];
  queue: CGuildSettingsQueue;
  levels: CGuildSettingsLevels;
  music: CGuildSettingsMusic;
  automod: CGuildSettingsAutoMod;
  channels: CGuildSettingsChannels;
  toggles: CGuildSettingsToggles;
  users: CGuildSettingsUsers;
  roles: CGuildSettingsRoles;
  roleMenus: any[];
  autoSetupComplete: boolean;
  moderation: CGuildSettingsModeration;
}

export interface CClientOptions {
  discordOptions: DiscordClientOptions;
  redisOptions?: RedisClientOptions;
  redisTTL: number;
  encryptionOptions?: CipherCCMOptions;
  clientId: string;
  clientSecret: string;
  discordToken: string;
  owners: UserResolvable[];
  defaults: {
    prefix: string;
  };
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
