import { Client } from "discord.js";
import { Key } from '../data/entities/key.entity';
import { KeysRepository } from '../database';

export class RecoverCompromisedWallets {
    static schema = {
        "name": "recover_compromised_wallets",
        "description": "Recover your compromised wallet"
    };

    static callback = async (client: Client, interaction: any, ) => {
        const userId: string = interaction?.user?.id ?? interaction?.member?.user?.id;
        const channel = await client.channels.cache.get(interaction.channel_id);
            const keysRepository: KeysRepository = new KeysRepository();
            const keys: Key[] = await keysRepository.findByUserID(userId);
            if(keys.length > 0) {
                // Join all signing keys to a string separated by commas if there are multiple
                const keyString: string = keys.map(key => `\`${key.signingkey}\``).join(', ');
                try{
                    interaction.reply({
                        content:
`Hello,
It looks like you accidentally pasted your TNB Wallet signing key(s) on a Discord server. We have transferred all coins from the exposed account(s) to new account(s). Here's the signing key(s) for your new account(s) - ${keyString}
Checkout https://thenewboston.com/wallet/recover-an-account for detailed steps on recovering your account using the signing key(s).`,
                        ephemeral: true
                    });
                    // Delete once key is sent
                    keysRepository.deleteByUserID(userId);
                } catch (exception) {
                    // interaction failed
                    console.error(exception);
                    interaction.reply({
                        content: 'Something went wrong! Please try again later',
                        ephemeral: true
                    });
                }

            } else {
                interaction.reply({
                    content: 'No keys found for this user',
                    ephemeral: true
                });
            }
    };
}
