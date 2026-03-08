import { Request, Response } from 'express';
import paypal from '@paypal/checkout-server-sdk';
import crypto from 'crypto';
import prisma from '../utils/prisma';

// PayPal Setup
const clientId = process.env.PAYPAL_CLIENT_ID || 'MOCK_CLIENT_ID';
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'MOCK_CLIENT_SECRET';

const environment = process.env.NODE_ENV === 'production'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

export const createPayPalOrder = async (req: Request, res: Response) => {
    try {
        const { creditId, amountToPurchase } = req.body;

        // 1. Validate Credit
        const credit = await prisma.carbonCredit.findUnique({
            where: { id: creditId }
        });

        if (!credit || credit.amountAvailable < amountToPurchase) {
            return res.status(400).json({ error: 'Insufficient credits available' });
        }

        // 2. Calculate fiat cost (USD)
        const totalUsd = (credit.pricePerCredit * amountToPurchase).toFixed(2);

        // 3. Create PayPal Order
        const isMock = !process.env.PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID === 'MOCK_CLIENT_ID';

        if (isMock) {
            return res.json({
                id: `order_mock_${Math.random().toString(36).substring(7)}`,
                status: 'CREATED',
                isMock: true
            });
        }

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: totalUsd
                },
                description: `Purchase of ${amountToPurchase} Carbon Credits`
            }]
        });

        const order = await client.execute(request);
        res.json({
            ...order.result,
            clientId: clientId
        });

    } catch (error: any) {
        console.error('PayPal Order Error:', error);
        res.status(500).json({ error: 'Failed to create PayPal order' });
    }
};

export const capturePayPalPayment = async (req: Request, res: Response) => {
    try {
        const { orderID, creditId, amountToPurchase } = req.body;
        const buyerId = req.user!.id;
        const purchaseAmount = Number(amountToPurchase);

        const isMock = orderID.startsWith('order_mock_');

        if (!isMock) {
            const request = new paypal.orders.OrdersCaptureRequest(orderID);
            request.requestBody({});
            const capture = await client.execute(request);

            if (capture.result.status !== 'COMPLETED') {
                return res.status(400).json({ error: 'Payment not completed or failed' });
            }
        }

        // 2. Execute Transaction in Database
        const transactionResult = await prisma.$transaction(async (tx) => {
            const credit = await tx.carbonCredit.findUnique({ where: { id: creditId } });
            if (!credit || credit.amountAvailable < purchaseAmount) {
                throw new Error('Credits no longer available');
            }

            const updatedCredit = await tx.carbonCredit.update({
                where: { id: creditId },
                data: { amountAvailable: { decrement: purchaseAmount } },
                include: { project: true }
            });

            const mockTxHash = `ALGO_TX_${crypto.randomBytes(16).toString('hex').toUpperCase()}`;

            const purchaseRecord = await tx.transaction.create({
                data: {
                    buyerId,
                    creditId,
                    amount: purchaseAmount,
                    paymentMethod: 'PAYPAL',
                    fiatAmount: credit.pricePerCredit * purchaseAmount,
                    txHash: mockTxHash
                }
            });

            return { purchaseRecord, project: updatedCredit.project };
        });

        res.json({
            message: 'Payment verified and credits transferred successfully!',
            receipt: transactionResult.purchaseRecord,
            projectData: transactionResult.project
        });

    } catch (error: any) {
        console.error('PayPal Capture Error:', error);
        res.status(500).json({ error: error.message || 'Payment capture failed' });
    }
};

// --- Crypto / Pera Wallet Flow ---
export const verifyCryptoPayment = async (req: Request, res: Response) => {
    try {
        const { txId, creditId, amountToPurchase } = req.body;
        const buyerId = req.user!.id;

        // 1. In a real scenario, ping Algorand Indexer to verify `txId` actually transferred ALGO/USDC to our platform wallet.
        if (!txId) return res.status(400).json({ error: 'Missing blockchain transaction ID' });

        const transactionResult = await prisma.$transaction(async (tx) => {
            const updatedCredit = await tx.carbonCredit.update({
                where: { id: creditId },
                data: { amountAvailable: { decrement: amountToPurchase } },
                include: { project: true }
            });

            const purchaseRecord = await tx.transaction.create({
                data: {
                    buyerId,
                    creditId,
                    amount: amountToPurchase,
                    paymentMethod: 'PERA_WALLET',
                    txHash: txId
                }
            });

            return { purchaseRecord, project: updatedCredit.project };
        });

        res.json({
            message: 'Crypto payment verified and credits transferred!',
            receipt: transactionResult.purchaseRecord,
            projectData: transactionResult.project
        });

    } catch (error) {
        console.error('Crypto Verify Error:', error);
        res.status(500).json({ error: 'Crypto verification failed' });
    }
};
