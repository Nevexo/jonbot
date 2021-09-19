// Jonbot - A somewhat-ok management bot
// MIT 2021 - Cameron Fleming

import * as dotenv from "dotenv";
import { pino } from "pino";

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

dotenv.config()

const command_files = [
  "./commands/course.js"
]

export const log = pino({level: process.env.LOG_LEVEL || "info"});

const main = async () => {
  log.info(`start jonbot command deployment tool | log level: ${log.level}`);

  // Check all valid keys are in the env
  if (!process.env.DISCORD_TOKEN) { log.error("no DISCORD_TOKEN in env"); process.exit(1);}
  if (!process.env.CLIENT_ID) {log.error("no CLIENT_ID in env"); process.exit(1);}
  if (!process.env.GUILD_ID) {log.error("no GUILD_ID in env"); process.exit(1);}

  // Initalise REST module
  const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

  let commands = [];

  // Iterate all commands and register them
  for await (const cmd of command_files) {
    log.debug(`import: ${cmd}`)
    const module = await import(cmd);

    commands.push(module.Command);
    log.info(`discovered command: ${module.Command.name}`);
  }

  if (commands.length == 0) {log.error("no commands registered"); process.exit(1);}

  log.info(`registering ${commands.length} commands to guild ${process.env.GUILD_ID} with client id ${process.env.CLIENT_ID}`);

  // Send the commands to Discord for the specified guild
  const route = Routes.applicationGuildCommands(
    process.env.CLIENT_ID,
    process.env.GUILD_ID
  )

  log.debug(`route: PUT ${route}`)

  await rest.put(route, { body: commands }).catch(err => {
    log.error(err);
    process.exit(1)
  });

  log.info("registration complete!")
}

main();