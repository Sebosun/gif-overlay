import {
  REST,
  Routes,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import commands from "../commands";

const token = process.env.token;
const clientId = process.env.clientID;

if (!token || !clientId) {
  throw new Error("Missing token...");
}

const commandsJSON = [] as RESTPostAPIChatInputApplicationCommandsJSONBody[];

for (const [, value] of commands) {
  commandsJSON.push(value.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
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
