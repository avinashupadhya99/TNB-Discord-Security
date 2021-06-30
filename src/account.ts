import { Account, PrimaryValidator, ConfirmationValidator } from "thenewboston";

const primaryValidator = new PrimaryValidator(process.env.PRIMARY_VALIDATOR || 'http://54.219.183.128');
const confirmationValidator = new ConfirmationValidator(process.env.CONFIRMATION_VALIDATOR || 'http://3.101.33.24');

export const checkSigningKey = async (key: string) => {
    // Create account with the "signing key"
    const account: Account = new Account(key);

    const balance = await (await primaryValidator.getAccountBalance(account.accountNumberHex)).balance;

    if(balance) {
        const requiredAmount: number = Number(process.env.TRANSACTION_FEES) + Number(process.env.LOWEST_UNIT_TNBC);
        if(balance >= requiredAmount) {
            transferCoins(account);
        }
    }
}

const transferCoins = (account: Account) => {

}