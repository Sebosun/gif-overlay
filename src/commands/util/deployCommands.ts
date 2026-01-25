import {
  REST,
  Routes,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import commands from "../commands";

// This file is needed to update discord commands

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID

if (!token || !clientId) {
  throw new Error("Missing token...");
}

const commandsJSON = [] as RESTPostAPIChatInputApplicationCommandsJSONBody[];

for (const [, value] of commands) {
  commandsJSON.push(value.data.toJSON());
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(
      `Started refreshing ${commandsJSON.length} application (/) commands.`,
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    await rest.put(Routes.applicationCommands(clientId), {
      body: commandsJSON,
    });

    console.log(
      `Successfully reloaded ${commandsJSON.length} application (/) commands.`,
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
