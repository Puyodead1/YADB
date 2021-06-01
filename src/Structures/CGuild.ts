import { Client } from "discord.js";
import { Structures } from "discord.js";
import { CGuildSettings } from "../Interfaces/CInterfaces";

const defaultGuildSettings: CGuildSettings = {
  tags: [],
  messages: {
    leave: "It's sad to see you leave **{{name}}**, hope to see you again.",
    join: "Welcome **{{mention}}** to {{guild}}, we hope you enjoy your stay!",
    membersVoiceStats: "Member Count: {{memberCount}}",
    botsVoiceStats: "Bot Count: {{botCount}}",
    usersVoiceStats: "User Count: {{userCount}}",
    channelsVoiceStats: "Channel Count: {{channelCount}}",
    rolesVoiceStats: "Role Count: {{roleCount}}",
  },
  modLogs: [],
  queue: {
    songs: [],
    playing: false,
    voice: undefined,
    channel: undefined,
    volume: 100,
    loop: undefined,
    voteSkip: [],
    locked: false,
    bass: undefined,
    shuffle: false,
    summoned: false,
    player: undefined,
    playerJson: undefined,
    parties: [],
  },
  levels: {
    enabled: false,
    message: "GG {{mention}}, you have ranked up to **level {{level}}**!",
    levelRoles: [],
    embed: false,
    multiplier: 1,
    announce: "current",
  },
  music: {
    enabled: true,
    announce: false,
    djOnly: true,
    djRoles: [],
    djBulkQueue: false,
    preventDupes: false,
    volume: 100,
    maxUserSongs: undefined,
    parties: true,
  },
  automod: {
    invites: false,
    links: {
      enabled: false,
      strict: false,
      overrides: [],
    },
    emojis: {
      enabled: false,
      max: 7,
    },
    mentions: {
      enabled: false,
      max: 7,
    },
    caps: false,
    bannedWords: [],
    nsfw: false,
    overrides: {
      roles: [],
      channels: [],
    },
    ignoreMods: true,
  },
  channels: {
    logging: {
      modLogs: undefined,
      raidAlerts: undefined,
      memberLogs: undefined,
      channelChanges: undefined,
      censoredMessages: undefined,
      roleChanges: undefined,
      userUpdates: undefined,
      voiceChanges: undefined,
      misc: undefined,
      messageLogs: undefined,
      spamLogs: undefined,
    },
    noXP: [],
    memberVoiceStats: undefined,
    botsVoiceStats: undefined,
    usersVoiceStats: undefined,
    channelsVoiceStats: undefined,
    rolesVoiceStats: undefined,
  },
  toggles: {
    autoRoles: false,
    staffBypass: false,
    selfRoles: false,
    afk: false,
    reactionRoles: false,
    logging: {
      modLogs: false,
      raidAlerts: false,
      memberLogs: false,
      channelChanges: false,
      censoredMessages: false,
      roleChanges: false,
      userUpdates: false,
      voiceChanges: false,
      misc: false,
      messageEdits: false,
      messageDelete: false,
      messageBulkDelete: false,
      spamLogs: false,
      ignoreBots: true,
    },
  },
  users: {
    admin: [],
    mod: [],
    staff: [],
  },
  roles: {
    autoRoles: [],
    selfRoles: [],
    admin: [],
    mod: [],
    staff: [],
    muted: undefined,
    noXP: [],
  },
  roleMenus: [],
  autoSetupComplete: false,
  moderation: {
    strikes: {
      punishments: {
        thresholds: {
          mute: -1,
          ban: -1,
          tempMute: -1,
          tempBan: -1,
        },
        durations: {
          mute: -1,
          ban: -1,
        },
      },
    },
  },
};

export default class CGuild extends Structures.get("Guild") {
  public settings: CGuildSettings;
  constructor(client: Client, data: any) {
    super(client, data);

    this.settings = defaultGuildSettings;
  }
}

declare module "discord.js" {
  export interface Guild {
    settings: CGuildSettings;
  }
}

Structures.extend("Guild", () => CGuild);
