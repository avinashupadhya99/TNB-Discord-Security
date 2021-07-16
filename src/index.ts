import { Client, Guild } from 'discord.js';
import 'reflect-metadata';
import { createConnection } from 'typeorm';

import * as dotenv from 'dotenv';
import { checkSigningKey } from './account';
import { Key } from './data/entities/key.entity';
import { KeysRepository } from './database';
dotenv.config();

const commands = [
    require('./commands/recover_compromised_wallets').schema
];

const client: Client = new Client();

client.on('ready', () => {
    console.log("Bot is alive");
    commands.forEach(command => {
        client.api.applications(client.user.id).commands.post({data: command});
    });
});

client.on('message', async (message) => {
    console.log(message.author.id);
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
                try{
                    await message.author.send(`
                    Hello,
                    It looks like you accidentally pasted your TNB Wallet signing key on a Discord server. We have transferred all coins from the exposed account to a new account. Here's the signing key for your new account - \`${newSigningKey}\`
                    Checkout https://thenewboston.com/wallet/recover-an-account for detailed steps on recovering your account using the signing key.
                    `);
                }
                catch(err) {
                    console.log(err);
                    reply = `
**Signing Key exposed**
                    
A certain signing key was exposed in this message. **One should not be sharing their signing key with anyone**. We could not reach you through your DM for providing your new signing key. Please enable DMs and use \`/recover_compromised_wallets\` to recover your account`
                    // Store in database
                    let keyObject: Key = new Key();
                    keyObject.signingkey = newSigningKey;
                    keyObject.userid = message.author.id;
                    const keysRepository: KeysRepository = new KeysRepository();
                    await keysRepository.insert(keyObject);
                }
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

client.ws.on('INTERACTION_CREATE', async interaction => {
    const command = interaction.data.name.toLowerCase();

    console.log(interaction);
    if(command === 'recover_compromised_wallets') {
        const channel = await client.channels.cache.get(interaction.channel_id);
        // Channel exists only if used inside a server
        if(channel) {
            client.api.interactions(interaction.id, interaction.token).callback.post({data: {
                type: 4,
                data: {
                    content: 'Use the command in DM to retreive your new signing key in case your wallet was compromised'
                }
            }})
        } else {
            // TODO: Fetch signing key from db and send
        }
    }
})


createConnection().then(async () => {
    client.login(process.env.DISCORD_BOT_TOKEN);
});