import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptions } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";

@ApplyOptions<CommandOptions>({
  description: "Ping",
  chatInputCommand: {
    register: true,
    guildIds: ["638455519652085780"],
  },
})
export class UserCommand extends Command {
  public async chatInputRun(interaction: CommandInteraction) {
    return interaction.reply("Pong!");
  }
}
