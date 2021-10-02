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
            if(!channel) {
                console.log(interaction);
                // @ts-ignore
                client.api.interactions(interaction.id, interaction.token).callback.post({data: {
                    type: 4,
                    data: {
                        content: 'Something went wrong! Please try again later'
                    }
                }});
            }
            if(channel && channel.type === 'DM') {
                const keysRepository: KeysRepository = new KeysRepository();
                const keys: Key[] = await keysRepository.findByUserID(userId);
                if(keys.length > 0) {
                    // Join all signing keys to a string separated by commas if there are multiple
                    const keyString: string = keys.map(key => `\`${key.signingkey}\``).join(', ');
                    try{
                        // @ts-ignore
                        await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
                            type: 4,
                            data: {
                                content:
`Hello,
It looks like you accidentally pasted your TNB Wallet signing key(s) on a Discord server. We have transferred all coins from the exposed account(s) to new account(s). Here's the signing key(s) for your new account(s) - ${keyString}
Checkout https://thenewboston.com/wallet/recover-an-account for detailed steps on recovering your account using the signing key(s).`
                            }
                        }});
                        // Delete once DM is sent
                        keysRepository.deleteByUserID(userId);
                    } catch (exception) {
                        // DM failed
                        console.error(exception);
                    }

                } else {
                    // @ts-ignore
                    client.api.interactions(interaction.id, interaction.token).callback.post({data: {
                        type: 4,
                        data: {
                            content: 'No keys found for this user'
                        }
                    }});
                }
            } else {
                // @ts-ignore
                client.api.interactions(interaction.id, interaction.token).callback.post({data: {
                    type: 4,
                    data: {
                        content: 'Use the command in DM to retreive your new signing key in case your wallet was compromised'
                    }
                }});
            }
    };
}
