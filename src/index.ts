import { Client, Guild } from 'discord.js';
import 'reflect-metadata';
import { createConnection } from 'typeorm';

import * as dotenv from 'dotenv';
import { checkSigningKey } from './account';
import { Key } from './data/entities/key.entity';
import { KeysRepository } from './database';
dotenv.config();
import { RecoverCompromisedWallets } from './commands/recover_compromised_wallets';

const commands = [
    RecoverCompromisedWallets.schema
];

const client: Client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

client.on('ready', async () => {
    console.log("Bot is alive");
    // @ts-ignore
    const globalCmds = await client.api.applications(client.user.id).commands().get();
    globalCmds.forEach(async (command: any) => {
        // @ts-ignore
        await client.api.applications(client.user.id).commands(command.id).delete();
    });
    // @ts-ignore
    const cmds = await client.api.applications(client.user.id).commands().get();
    commands.forEach(command => {
        // @ts-ignore
        client.api.applications(client.user.id).commands.post({data: command});
    });
});

client.on('message', async (message) => {
    const pattern = /[a-zA-Z0-9]{64}/g;
    let match = pattern.exec(message.content);
    while(match) {
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

// @ts-ignore
client.ws.on('INTERACTION_CREATE', async interaction => {
    const command: string = interaction.data.name.toLowerCase();

    if(command === 'recover_compromised_wallets') {
        RecoverCompromisedWallets.callback(client, interaction);
    }
})


createConnection().then(async () => {
    client.login(process.env.DISCORD_BOT_TOKEN);
});
