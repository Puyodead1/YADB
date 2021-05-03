import CClient from "../CClient";

export default (client: CClient) => {
  console.log(`[Ready] Logged in as ${client.user?.tag}.`);

  client.mentionPrefix = new RegExp(`^<@!?${client.user?.id}>`);

  client.guilds.cache.get("638455519652085780")?.commands.create({
    name: "git",
    description: "Gets current git branch",
    options: [
      {
        type: 5,
        name: "ephemeral",
        description: "Whether the reply should be ephemeral",
        required: false,
      },
    ],
  });

  client.guilds.cache.get("638455519652085780")?.commands.create({
    name: "ping",
    description: "Gets current bot ping",
  });

  client.guilds.cache.get("638455519652085780")?.commands.create({
    name: "eval",
    description: "Evaluates code",
    options: [
      {
        type: 3,
        name: "code",
        description: "Code to evaluate",
        required: true,
      },
      {
        type: 5,
        name: "ephemeral",
        description: "Whether the reply should be ephemeral",
        required: false,
      },
    ],
  });
};
