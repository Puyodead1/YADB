import Discord, {
  ClientOptions as DiscordClientOptions,
  Collection,
} from "discord.js";
import { promises, readdir } from "fs";
import { sep } from "node:path";
import { join, resolve } from "path";
import { ClientOpts as RedisClientOptions, RedisClient } from "redis";
import CCommand from "./Interfaces/CCommand.interface";
import Crypto from "crypto";
import { Cipher, CipherGCMOptions } from "node:crypto";

export interface CClientOptions {
  discord: {
    clientId: string;
    clientSecret: string;
  } & DiscordClientOptions;
  redis?: {
    ttl?: number;
  } & RedisClientOptions;
  encryption?: CipherGCMOptions;
}

export default class CClient extends Discord.Client {
  public commands: Collection<string, CCommand>;
  public mentionPrefix: RegExp | undefined;
  readonly redisClient: RedisClient;
  readonly encryptionKey: string;
  readonly encryptionIv: Buffer;

  constructor(options: CClientOptions) {
    super(options.discord);

    // variables used for data encryption
    this.encryptionKey = Crypto.createHash("sha256")
      .update(options.discord.clientSecret)
      .digest("base64")
      .substr(0, 32);

    this.encryptionIv = Crypto.randomBytes(16);

    this.commands = new Collection<string, CCommand>();
    this.redisClient = new RedisClient(options.redis || {});

    this.loadEvents();
    this.loadCommands();
  }

  /**
   * Encrypts data
   * @param data data to encrypt
   * @returns an object containing the iv and encrypted content
   */
  encryptData(data: any) {
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
  }

  /**
   * Decrypts data
   * @param content encrypted content to decrypt in hex
   * @param iv the iv to use for decryption in hex, defaults to this instances current iv
   * @returns the decrypted data
   */
  decryptData(content: string, iv?: string) {
    const decryptionIv = iv ? Buffer.from(iv, "hex") : this.encryptionIv;
    const decipher = Crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(this.encryptionKey),
      decryptionIv
    );
    let decrypted = decipher.update(Buffer.from(content, "hex"));
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  }

  loadEvents() {
    readdir(join(__dirname, "Events"), (err, files) => {
      if (err) {
        return console.error(err);
      }

      files
        .filter((file) => file.endsWith(".js"))
        .forEach((file) => {
          const event: Function = require(join(__dirname, "Events", file))
            .default;
          const eventName = file.split(".")[0];
          this.on(eventName, event.bind(null, this));
          delete require.cache[
            require.resolve(join(__dirname, "Events", file))
          ];
          console.log(`[Event] Event loaded: ${eventName}`);
        });
    });
  }

  loadCommand(category: string, name: string) {
    try {
      const props: CCommand = require(join(
        __dirname,
        "Commands",
        category,
        name
      ));
      this.commands.set(name, props);
      console.log(`[Commands] Loaded command ${name}`);
      return true;
    } catch (e) {
      throw e;
    }
  }

  unloadCommand(name: string) {
    let command: CCommand | undefined;
    if (this.commands.has(name)) {
      command = this.commands.get(name);
    }
    if (!command) throw new Error("Command does not exist or is not loaded!");
    this.commands.delete(name);
    const mod =
      require.cache[
        require.resolve(
          join(__dirname, "Commands", command.info.category, command.info.name)
        )
      ];

    delete require.cache[
      require.resolve(
        join(__dirname, "Commands", command.info.category, command.info.name)
      )
    ];
    if (!mod) {
      throw new Error(
        `[Commands] Failed to unload command ${name}: Failed to get module!`
      );
    }

    if (!mod.parent)
      throw new Error(
        `[Commands] Failed to unload command ${name}: Failed to get module parent!`
      );

    if (!mod.parent?.children)
      throw new Error(
        `[Commands] Failed to unload command ${name}: Failed to get children!`
      );

    for (let i = 0; i < mod.parent.children.length; i++) {
      if (mod.parent.children[i] === mod) {
        mod.parent.children.splice(i, 1);
        break;
      }
    }

    return true;
  }

  async loadCommands() {
    for await (const f of this.getFiles(join(__dirname, "Commands"))) {
      if (!f.endsWith(".js")) continue;
      const split = f.split(sep);
      const name = split[split.length - 1].split(".")[0];
      try {
        this.loadCommand(split[split.length - 2].split(sep)[0], name);
      } catch (err) {
        console.error(err);
      }
    }

    console.log(`[Commands] Loaded ${this.commands.size} commands.`);
  }

  async *getFiles(dir: string): AsyncGenerator<string, any, undefined> {
    const dirents = await promises.readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
      const res = resolve(dir, dirent.name);
      if (dirent.isDirectory()) {
        yield* this.getFiles(res);
      } else {
        yield res;
      }
    }
  }
}
