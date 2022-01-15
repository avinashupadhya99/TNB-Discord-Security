import * as dotenv from 'dotenv';
dotenv.config();
import { Account, AccountPaymentHandler, PrimaryValidator } from "thenewboston";

const primaryValidatorURL: string = process.env.PRIMARY_VALIDATOR!;
const bankUrl: string = process.env.BANK_URL!;

const primaryValidator = new PrimaryValidator(primaryValidatorURL);

export const checkSigningKey = async (key: string): Promise<string> => {
    // Create account with the "signing key"
    const account: Account = new Account(key);

    const balance = await (await primaryValidator.getAccountBalance(account.accountNumberHex)).balance;

    if(balance) {
        const requiredAmount: number = Number(process.env.TRANSACTION_FEES) + Number(process.env.LOWEST_UNIT_TNBC);
        if(balance >= requiredAmount) {
            const newSigningKey: string = await transferCoins(account, balance);
            return new Promise<string>((resolve, reject) => {
                resolve(newSigningKey);
            });
        }
    }
    // Reject if there is no balance i.e, possibility of an account number
    return new Promise<string>((resolve, reject) => {
        reject("No balance, can be an account number");
    });
}

const transferCoins = async(account: Account, balance: number): Promise<string> => {
    const paymentHandlerOptions = {
        account: account,
        bankUrl: bankUrl,
    };

    const paymentHandler = new AccountPaymentHandler(paymentHandlerOptions);

    await paymentHandler.init();

    const newAccount: Account = new Account();

    const amount: number = balance - Number(process.env.TRANSACTION_FEES);

    await paymentHandler.sendCoins(newAccount, amount, "Transferring coins due to exposed signing key on Discord");
    
    return new Promise<string>((resolve, reject) => {
        resolve(newAccount.signingKeyHex);
    });
}