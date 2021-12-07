import RedisClient from "ioredis";
import Crypto from "crypto";
import type {
  CPermissionLevels,
  CClientOptions,
} from "../Interfaces/CInterfaces";
import type GuildSettings from "./GuildSettings";
import { SapphireClient } from "@sapphire/framework";
import type { Message, Collection } from "discord.js";

export default class CClient extends SapphireClient {
  public mentionPrefix: RegExp | undefined;
  readonly redisClient: RedisClient.Redis;
  readonly encryptionKey: string;
  readonly encryptionIv: Buffer;
  readonly permLevelCache: any;
  readonly permissionLevelCache: any;
  readonly permissionLevels: CPermissionLevels[];

  constructor(options: CClientOptions) {
    super(options.discordOptions);

    this.permissionLevels = options.permissionLevels;

    // variables used for data encryption
    this.encryptionKey = Crypto.createHash("sha256")
      .update(options.clientSecret)
      .digest("base64")
      .substr(0, 32);

    this.encryptionIv = Crypto.randomBytes(16);

    this.redisClient = new RedisClient(options.redisOptions || {});

    this.permissionLevelCache = {};
    for (let i = 0; i < this.permissionLevels.length; i++) {
      const level = this.permissionLevels[i];
      this.permissionLevelCache[level.name] = level.level;
    }
  }

  getPermissionLevel(message: Message) {
    let permlvl = 0;

    const permOrder = this.permissionLevels
      .slice(0)
      .sort((p, c) => (p.level < c.level ? 1 : -1));

    while (permOrder.length) {
      const currentLevel = permOrder.shift();
      if (!currentLevel) return;
      if (currentLevel.check(message)) {
        permlvl = currentLevel.level;
        break;
      }
    }
    return permlvl;
  }

  /**
   * Encrypts data
   * @param data data to encrypt
   * @returns an object containing the iv and encrypted content
   */
  public encryptData = (data: any): { iv: string; content: string } => {
    let content: string;
    if (typeof data === "string") {
      content = data;
    } else if (typeof data === "object") {
      content = JSON.stringify(data);
    } else if (typeof data === "number") {
      content = data.toString();
    } else {
      throw new Error(
        `Data must be of type string, object, or number. Recieved ${typeof data}`
      );
    }

    const cipher = Crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(this.encryptionKey),
      this.encryptionIv
    );

    let encrypted = cipher.update(content);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return {
      iv: this.encryptionIv.toString("hex"),
      content: encrypted.toString("hex"),
    };
  };

  /**
   * Decrypts data
   * @param content encrypted content to decrypt in hex
   * @param iv the iv to use for decryption in hex, defaults to this instances current iv
   * @returns the decrypted data
   */
  public decryptData = (content: string, iv?: string): string => {
    const decryptionIv = iv ? Buffer.from(iv, "hex") : this.encryptionIv;
    const decipher = Crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(this.encryptionKey),
      decryptionIv
    );
    let decrypted = decipher.update(Buffer.from(content, "hex"));
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  };
}

declare module "discord.js" {
  export interface Client {
    guildSettings: Collection<string, GuildSettings>;
    redisClient: RedisClient.Redis;
    decryptData: (content: string, iv?: string) => string;
    encryptData: (data: any) => { iv: string; content: string };
  }
}
