// Jonbot - A somewhat-ok management bot
// MIT 2021 - Cameron Fleming

import * as dotenv from "dotenv";
import { pino } from "pino";
import { Client, Intents } from "discord.js";
dotenv.config()

const cmd_files = [
  "./commands/course.js"
];

let commands = [];

export const log = pino({level: process.env.LOG_LEVEL || "info"});

export const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on("ready", async () => {
  // Called when the bot connects to the gateway successfully.
  log.info(`logged in as ${client.user.username} at ${new Date().toISOString()}`);
})

client.on("interactionCreate", async (interaction) => {
  // Handle all interractions destined for this bot 
  if (!interaction.isCommand() && !interaction.isButton()) return; // TODO: handle buttons

  log.debug(`[cmd handler] startup: interaction command trigger ${interaction.commandName}`)
  
  // Attempt to find the handler for this command
  if (interaction.isCommand()) {
    for await (const command of commands) {
      if (command.name == interaction.commandName) {
        // A handler was found, invoke it.
        log.debug(`[cmd handler] indexing: found handler ${command.name}`)
        log.debug(`[cmd handler] options: ${command.options}`)
        log.info(`[cmd handler] handling intreraction for ${command.name} command from ${interaction.user.username}`);
        await command.module.handle(interaction);
        
        return;
      }
    }
  }

  if (interaction.isButton()) {
    await interaction.reply("https://cdn.discordapp.com/attachments/769289674631807006/825011827980894228/unknown.png")
  }
  
  log.warn(`[cmd handler] no suitable handler found, dropping.`);
})

const main = async () => {
  log.info(`starting jonbot at ${new Date().toISOString()} | log level: ${log.level}`);
  if (!process.env.DISCORD_TOKEN) {log.error("no DISCORD_TOKEN in env, aborting"); process.exit(1);}

  // Load commands
  log.debug("start command loading")
  for await (const cmd_file of cmd_files) {
    log.debug(`loading ${cmd_file}`);
    const module = await import(cmd_file);

    log.debug(`${cmd_file} implements ${module.Command.name} command`)
    commands.push({name: module.Command.name, module: module});
  }
  log.info(`initalised commands, registered commands: ${commands.length}`);

  // Login to Discord gateway
  await client.login(process.env.DISCORD_TOKEN)
}

main();