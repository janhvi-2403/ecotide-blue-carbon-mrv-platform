import algosdk from 'algosdk';
import crypto from 'crypto';

const algodToken = process.env.ALGOD_TOKEN || '';
const algodServer = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud';
const algodPort = process.env.ALGOD_PORT || '';

const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
const isMockMode = !process.env.ALGO_CREATOR_MNEMONIC;
const APP_ID = parseInt(process.env.ALGORAND_APP_ID || '0'); // Smart Contract Application ID

// Helper to get creator account
export const getCreatorAccount = (): algosdk.Account | null => {
    const mnemonic = process.env.ALGO_CREATOR_MNEMONIC;
    if (!mnemonic) return null;
    return algosdk.mnemonicToSecretKey(mnemonic);
};

export const storeHashOnChain = async (hash: string): Promise<string | null> => {
    if (isMockMode) {
        // SIMULATION MODE
        console.warn('Simulation Mode: Generated Mock Algorand TxHash for Hash Storage.');
        return `TX_${crypto.randomBytes(16).toString('hex').toUpperCase()}`;
    }

    try {
        const account = getCreatorAccount();
        if (!account) throw new Error('No Account');
        const suggestedParams = await algodClient.getTransactionParams().do();

        // Create a zero-algo transaction just to store the note
        const note = new Uint8Array(Buffer.from(`EcoTide MRV Report Hash: ${hash}`));

        const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
            sender: account.addr,
            receiver: account.addr, // send to self
            amount: 0,
            note,
            suggestedParams,
        });

        const signedTxn = txn.signTxn(account.sk);
        const sendResponse = await algodClient.sendRawTransaction(signedTxn).do();
        const txId = sendResponse.txid;

        // Wait for confirmation
        await algosdk.waitForConfirmation(algodClient, txId, 4);

        return txId;
    } catch (error) {
        console.error('Error storing hash on Algorand:', error);
        return null;
    }
};

export const mintCarbonCreditsAsASA = async (projectName: string, amountToMint: number): Promise<string | null> => {
    if (isMockMode) {
        // SIMULATION MODE
        console.warn('Simulation Mode: Generated Mock Algorand ASA Token ID for Credits.');
        return `${Math.floor(Math.random() * 90000000) + 10000000}`; // Random 8 digit integer as Asset ID
    }

    try {
        const account = getCreatorAccount();
        if (!account) throw new Error('No Account');
        const suggestedParams = await algodClient.getTransactionParams().do();

        // Asset Details
        const totalIssuance = Math.floor(amountToMint); // Assets usually need to be integers
        const decimals = 0;
        const assetName = "EcoTideCC";
        const unitName = "ETCC";
        const assetURL = "https://ecotide.org";

        const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
            sender: account.addr,
            total: totalIssuance,
            decimals,
            defaultFrozen: false,
            assetName,
            unitName,
            assetURL,
            manager: account.addr,
            reserve: account.addr,
            freeze: account.addr,
            clawback: account.addr,
            suggestedParams
        });

        const signedTxn = txn.signTxn(account.sk);
        const sendResponse = await algodClient.sendRawTransaction(signedTxn).do();
        const txId = sendResponse.txid as string;

        const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
        const assetId = confirmedTxn.assetIndex;

        return assetId?.toString() || null;

    } catch (error) {
        console.error('Error minting ASA on Algorand:', error);
        return null;
    }
};

/**
 * Calls the Smart Contract to verify a report and update global state
 */
export const verifyReportOnChain = async (reportHash: string, creditsToMint: number): Promise<string | null> => {
    if (isMockMode || !APP_ID) {
        console.warn('Simulation Mode or No AppID: Generated Mock Smart Contract TxHash.');
        return `APP_TX_${crypto.randomBytes(16).toString('hex').toUpperCase()}`;
    }

    try {
        const account = getCreatorAccount();
        if (!account) throw new Error('No Account');
        const suggestedParams = await algodClient.getTransactionParams().do();

        // Application Args: ["verify", report_hash, amount_to_mint]
        const appArgs = [
            new Uint8Array(Buffer.from("verify")),
            new Uint8Array(Buffer.from(reportHash)),
            algosdk.encodeUint64(creditsToMint)
        ];

        const txn = algosdk.makeApplicationNoOpTxnFromObject({
            sender: account.addr,
            suggestedParams,
            appIndex: APP_ID,
            appArgs,
        });

        const signedTxn = txn.signTxn(account.sk);
        const sendResponse = await algodClient.sendRawTransaction(signedTxn).do();
        const txId = sendResponse.txid;

        await algosdk.waitForConfirmation(algodClient, txId, 4);
        return txId;
    } catch (error) {
        console.error('Error calling Smart Contract:', error);
        return null;
    }
};
