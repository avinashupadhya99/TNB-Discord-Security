import { Client, Guild } from 'discord.js';
import 'reflect-metadata';
import { createConnection } from 'typeorm';

import * as dotenv from 'dotenv';
import { checkSigningKey } from './account';
dotenv.config();

const client = new Client();

client.on('ready', () => {
    console.log("Bot is alive");
    client.guilds.cache.map((guild: Guild) => console.log(guild.id));
});

client.on('message', async (message) => {
    console.log(message.content);
    const pattern = /[a-zA-Z0-9]{64}/g;
    let match = pattern.exec(message.content);
    while(match) {
        console.log(match[0]);
        try{
            const newSigningKey = await checkSigningKey(match[0]);
            
            if(newSigningKey) {
                let reply: string = `
                **Signing Key exposed**

                A certain signing key was exposed in this message. **One should not be sharing their signing key with anyone**. Please **check your DM** for further details`;
                message.author.send(`
                Hello,
                It looks like you accidentally pasted your TNB Wallet signing key on a Discord server. We have transferred all coins from the exposed account to a new account. Here's the signing key for your new account - \`${newSigningKey}\`
                Checkout https://thenewboston.com/wallet/recover-an-account for detailed steps on recovering your account using the signing key.
                `).catch(async err => {
                    console.log(err);
                    reply = `**Signing Key exposed**
                    
                    A certain signing key was exposed in this message. **One should not be sharing their signing key with anyone**. We could not reach you through your DM for providing your new signing key. Please enable DMs and use \`/recover_compromised_wallets\` to recover your account`
                    // TODO: Store in database
                });
                message.reply(reply);
                // Stop checking if a signing key is already found
                break;
            }
        } catch(exception) {
            console.error(exception);
            // Do nothing
        }
        pattern.lastIndex = match.index + 1;
        match = pattern.exec(message.content);
    }
});


createConnection().then(async () => {
    client.login(process.env.DISCORD_BOT_TOKEN);
});