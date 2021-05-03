import { CommandInteraction } from "discord.js";
import CClient from "../CClient";
import { CCommandType } from "../Interfaces/CCommand.interface";
import { prefix } from "../config.json";

export default (client: CClient, interaction: CommandInteraction) => {
  if (!interaction.isCommand()) return;

  if (client.commands.has(interaction.commandName)) {
    const cmd = client.commands.get(interaction.commandName);
    if (cmd?.info.type === CCommandType.COMMAND)
      return interaction.reply(
        `That command is not a slash command! Please use '${prefix}${cmd.info.name}'.`
      );
    return cmd?.run(client, interaction, null);
  }
};
