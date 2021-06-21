import { Client, Guild, MessageEmbed } from 'discord.js';

import * as dotenv from 'dotenv';
dotenv.config();

const client = new Client();

client.on('ready', () => {
    console.log("Bot is alive");
    client.guilds.cache.map((guild: Guild) => console.log(guild.id));
});


client.login(process.env.DISCORD_BOT_TOKEN);