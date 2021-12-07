import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptions } from "@sapphire/framework";
import { exec } from "child_process";
import { CommandInteraction, MessageEmbed } from "discord.js";

@ApplyOptions<CommandOptions>({
  description: "Retrieve bot Git information",
  chatInputCommand: {
    register: true,
    guildIds: ["638455519652085780"],
  },
})
export class UserCommand extends Command {
  getBranch(): Promise<string> {
    return new Promise((resolve, reject) => {
      exec("git rev-parse --abbrev-ref HEAD", (err, stdout, _) => {
        if (err) reject(err);

        resolve(stdout.replace("\n", ""));
      });
    });
  }

  getCommit(): Promise<string> {
    return new Promise((resolve, reject) => {
      exec("git rev-parse HEAD", (err, stdout, _) => {
        if (err) reject(err);

        resolve(stdout.replace("\n", ""));
      });
    });
  }

  public async chatInputRun(interaction: CommandInteraction) {
    const commit = await this.getCommit();
    const branch = await this.getBranch();

    const embed = new MessageEmbed()
      .addField("Current Branch", branch)
      .addField("Commit", commit)
      .setTimestamp()
      .setColor("PURPLE");
    return interaction.reply({
      embeds: [embed],
    });
  }
}
