import Discord, { ClientOptions, Collection } from "discord.js";
import { promises, readdir } from "fs";
import { sep } from "node:path";
import { join, resolve } from "path";
import CCommand from "./Interfaces/CCommand.interface";

export default class CClient extends Discord.Client {
  constructor(options: ClientOptions) {
    super(options);

    this.commands = new Collection<string, CCommand>();

    this.loadEvents();
    this.loadCommands();
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
    const main = mod?.require?.main;
    if (!main)
      throw new Error(
        `[Commands] Failed to unload command ${name}: Failed to get module main!`
      );
    const len = main.children.length;
    if (!len)
      throw new Error(
        `[Commands] Failed to unload command ${name}: Failed to get children length!`
      );

    for (let i = 0; i < len; i++) {
      if (main.children[i] === mod) {
        main.children.splice(i, 1);
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

  public commands: Collection<string, CCommand>;
  public mentionPrefix: RegExp | undefined;
}
