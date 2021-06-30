import { Client, Guild, MessageEmbed } from 'discord.js';

import * as dotenv from 'dotenv';
import { checkSigningKey } from './account';
dotenv.config();

const client = new Client();

client.on('ready', () => {
    console.log("Bot is alive");
    client.guilds.cache.map((guild: Guild) => console.log(guild.id));
});

client.on('message', message => {
    const pattern = /[a-zA-Z0-9]{64}/g;
    let match = pattern.exec(message.content);
    while(match) {
        checkSigningKey(match[0]);
        pattern.lastIndex = match.index + 1;
        match = pattern.exec(message.content);
    }
});


client.login(process.env.DISCORD_BOT_TOKEN);