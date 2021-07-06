import { Account, AccountPaymentHandler, PrimaryValidator, ConfirmationValidator } from "thenewboston";

const primaryValidator = new PrimaryValidator(process.env.PRIMARY_VALIDATOR || 'http://54.219.183.128');
const confirmationValidator = new ConfirmationValidator(process.env.CONFIRMATION_VALIDATOR || 'http://3.101.33.24');
const bankUrl = process.env.BANK_URL || 'http://13.233.77.254';

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
    // Reject if balance is not sufficient
    return new Promise<string>((resolve, reject) => {
        reject();
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
    console.log(newAccount.accountNumberHex);
    console.log(newAccount.signingKeyHex);

    const amount: number = balance - Number(process.env.TRANSACTION_FEES);

    await paymentHandler.sendCoins(newAccount, amount, "Transferring coins due to exposed signing key on Discord");
    
    return new Promise<string>((resolve, reject) => {
        resolve(newAccount.signingKeyHex);
    });
}