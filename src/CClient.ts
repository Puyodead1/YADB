import Discord, { Collection, Message } from "discord.js";
import { promises, readdir } from "fs";
import { sep } from "node:path";
import { join, resolve } from "path";
import { RedisClient } from "redis";
import Crypto from "crypto";
import CCommand from "./lib/CCommand";
import CEvent from "./lib/CEvent";
import { CClientOptions, CPermissionLevels } from "./Interfaces/CInterfaces";

export default class CClient extends Discord.Client {
  public commands: Collection<string, CCommand>;
  public mentionPrefix: RegExp | undefined;
  readonly redisClient: RedisClient;
  readonly encryptionKey: string;
  readonly encryptionIv: Buffer;
  readonly permLevelCache: any;
  readonly defaults: { prefix: string };
  readonly owners: Discord.UserResolvable[];
  readonly permissionLevelCache: any;
  readonly permissionLevels: CPermissionLevels[];

  constructor(options: CClientOptions) {
    super(options.discordOptions);

    this.owners = options.owners;
    this.defaults = options.defaults;
    this.permissionLevels = options.permissionLevels;

    // variables used for data encryption
    this.encryptionKey = Crypto.createHash("sha256")
      .update(options.clientSecret)
      .digest("base64")
      .substr(0, 32);

    this.encryptionIv = Crypto.randomBytes(16);

    this.commands = new Collection<string, CCommand>();
    this.redisClient = new RedisClient(options.redisOptions || {});

    this.permissionLevelCache = {};
    for (let i = 0; i < this.permissionLevels.length; i++) {
      const level = this.permissionLevels[i];
      this.permissionLevelCache[level.name] = level.level;
    }

    this.loadEvents();
    this.loadCommands();
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
          const event: CEvent = new (require(join(
            __dirname,
            "Events",
            file
          )).default)(this);
          const eventName = file.split(".")[0];
          this.on(eventName, (...args) => event.run(...args));
          delete require.cache[
            require.resolve(join(__dirname, "Events", file))
          ];
          console.log(`[Event] Event loaded: ${eventName}`);
        });
    });
  }

  loadCommand(category: string, name: string) {
    try {
      const props: CCommand = new (require(join(
        __dirname,
        "Commands",
        category,
        name
      )).default)(this);
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
