import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import crypto from 'crypto';

// --- Browse Projects / Marketplace ---
export const getAvailableProjects = async (req: Request, res: Response) => {
    try {
        const { location, species } = req.query;

        // Build advanced filters if provided
        const whereClause: any = {
            status: 'APPROVED',
            carbonCredits: {
                some: {
                    amountAvailable: { gt: 0 }
                }
            }
        };

        if (location) {
            whereClause.location = { contains: String(location) }; // SQLite doesn't support case insensitive natively for contains without raw query, but this is fine for now.
        }
        if (species) {
            whereClause.species = { contains: String(species) };
        }

        const projects = await prisma.project.findMany({
            where: whereClause,
            include: {
                carbonCredits: true,
                reports: {
                    where: { status: 'APPROVED' },
                    select: { hash: true, fileUrl: true, expectedCarbon: true, treeHeight: true, onChainTxId: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(projects);
    } catch (error) {
        console.error('Error fetching marketplace projects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// --- Purchase Flow ---
export const purchaseCredits = async (req: Request, res: Response) => {
    try {
        const { creditId, amountToPurchase } = req.body;
        const buyerId = req.user!.id;

        if (!creditId || !amountToPurchase || amountToPurchase <= 0) {
            return res.status(400).json({ error: 'Invalid purchase data' });
        }

        // Use a transaction to ensure atomicity
        const transactionResult = await prisma.$transaction(async (tx) => {
            // 1. Fetch the credit and check availability
            const credit = await tx.carbonCredit.findUnique({
                where: { id: creditId },
                include: { project: true }
            });

            if (!credit) throw new Error('Credit not found');
            if (credit.amountAvailable < amountToPurchase) {
                throw new Error(`Only ${credit.amountAvailable} credits available.`);
            }

            // 2. Decrement availability
            const updatedCredit = await tx.carbonCredit.update({
                where: { id: creditId },
                data: {
                    amountAvailable: {
                        decrement: amountToPurchase
                    }
                }
            });

            // 3. Create Transaction Record
            // Note: In a real app with Stripe, we would create a payment intent first.
            // Here, we simulate a successful payment and generate a mock TxHash for the credit transfer.
            const mockTransferHash = `TX_${crypto.randomBytes(16).toString('hex').toUpperCase()}`;

            const purchaseRecord = await tx.transaction.create({
                data: {
                    buyerId,
                    creditId,
                    amount: amountToPurchase,
                    txHash: mockTransferHash
                }
            });

            return { purchaseRecord, updatedCredit, project: credit.project };
        });

        res.json({
            message: 'Purchase successful',
            receipt: transactionResult.purchaseRecord,
            projectData: transactionResult.project
        });

    } catch (error: any) {
        console.error('Error purchasing credits:', error);
        res.status(400).json({ error: error.message || 'Purchase failed' });
    }
};

// --- Token / Portfolio Management ---
export const getBuyerPortfolio = async (req: Request, res: Response) => {
    try {
        const buyerId = req.user!.id;

        const transactions = await prisma.transaction.findMany({
            where: { buyerId },
            include: {
                credit: {
                    include: {
                        project: {
                            select: { name: true, location: true, species: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Compute Aggregates
        const totalCreditsBought = transactions.reduce((acc, tx) => acc + tx.amount, 0);

        res.json({
            metrics: { totalCreditsBought },
            transactions
        });

    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
