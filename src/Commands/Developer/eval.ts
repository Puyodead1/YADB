import { CommandInteraction, Message, Permissions } from "discord.js";
import CClient from "../../CClient";
import req from "centra";
import { Stopwatch } from "@klasa/stopwatch";
import { clean, codeBlock, initClean, isThenable } from "@klasa/utils";
import { inspect } from "util";
import CCommand from "../../lib/CCommand";
import { CPermissionLevel } from "../../Interfaces/CInterfaces";

export default class extends CCommand {
  constructor(client: CClient) {
    super(client, {
      name: "eval",
      description: "Evaluates code",
      usage: "eval",
      category: "Developer",
      permissionLevel: CPermissionLevel.BOT_OWNER,
    });
  }

  formatTime(syncTime: any, asyncTime: any) {
    return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
  }

  async upload(body: string) {
    const res = await req(`https://hastebin.com/documents`, "POST")
      .body(body)
      .send();

    const json = await res.json();
    return `https://hastebin.com/${json.key}`;
  }

  async evalCode(
    client: CClient,
    msg: Message | CommandInteraction,
    code: string
  ) {
    code = code.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
    const stopwatch = new Stopwatch();
    let success, syncTime, asyncTime, result;
    let thenable = false;
    let type;

    try {
      // if (flags.async) code = `(async () => {\n${code}\n})();`;
      result = eval(code);
      syncTime = stopwatch.toString();
      type = typeof result;
      if (isThenable(result)) {
        thenable = true;
        stopwatch.restart();
        result = await result;
        asyncTime = stopwatch.toString();
      }
      success = true;
    } catch (error) {
      if (!syncTime) syncTime = stopwatch.toString();
      if (!type) type = typeof error;
      if (thenable && !asyncTime) asyncTime = stopwatch.toString();
      result = error.message;
      success = false;
    }
    stopwatch.stop();
    if (typeof result !== "string") {
      // result = inspect(result, {
      //   depth: flags.depth ? parseInt(flags.depth) || 0 : 0,
      //   showHidden: Boolean(flags.showHidden),
      // });
      result = inspect(result, {
        depth: 0,
        showHidden: false,
      });
    }
    return {
      success,
      type,
      time: this.formatTime(syncTime, asyncTime),
      result: clean(result),
    };
  }

  async run(msg: Message, args: string[], level: number) {
    let code: string;

    if (!args.length) return msg.reply("No code provided.");
    code = args.join(" ");
    initClean(this.client.token as string);
    const { success, result, time, type } = await this.evalCode(
      this.client,
      msg,
      code!
    );

    if (result.length > 2000) {
      const url = await this.upload(result);
      return msg.reply(`${url}\n${time}\n**Type**: ${type}`);
    }

    let output;
    if (success)
      output = `**Output**: ${codeBlock(
        "js",
        result
      )}\n**Type**: ${type}\n${time}`;
    else
      output = `**Error**: ${codeBlock(
        "js",
        result
      )}\n**Type**: ${type}\n${time}`;

    return msg.reply(output);
  }
}
