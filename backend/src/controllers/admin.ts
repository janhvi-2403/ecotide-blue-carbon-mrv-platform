import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { storeHashOnChain, mintCarbonCreditsAsASA, verifyReportOnChain } from '../services/algorand';

// --- User Management ---
export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            where: { role: { in: ['UPLOADER', 'BUYER'] } },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                _count: { select: { projects: true, reports: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const user = await prisma.user.update({
            where: { id: id as string },
            data: { isActive }
        });

        // Log Action
        await prisma.auditLog.create({
            data: {
                adminId: req.user!.id,
                actionType: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
                targetId: user.id,
                details: `Admin changed user status for ${user.email} to ${isActive ? 'Active' : 'Inactive'}`
            }
        });

        res.json({ message: 'User status updated', user });
    } catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// --- Report & Project Verification ---
export const verifyReport = async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const { status, carbonCreditsToMint, pricePerCredit, revisionNotes } = req.body;

        if (!['APPROVED', 'REJECTED', 'REVISION_REQUESTED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const report = await prisma.report.findUnique({
            where: { id: reportId as string },
            include: { project: true }
        }) as any;

        if (!report) return res.status(404).json({ error: 'Report not found' });

        let onChainTxId = report.onChainTxId;

        if (status === 'APPROVED') {
            // Using the NEW Smart Contract verification instead of just storing hash in a note
            if (!onChainTxId) {
                onChainTxId = await verifyReportOnChain(report.hash, carbonCreditsToMint || 0);
            }

            if (carbonCreditsToMint && carbonCreditsToMint > 0) {
                const assetId = await mintCarbonCreditsAsASA(report.project.name, carbonCreditsToMint);
                if (assetId) {
                    await prisma.carbonCredit.create({
                        data: {
                            projectId: report.projectId,
                            tokenAssetId: assetId,
                            amountTotal: carbonCreditsToMint,
                            amountAvailable: carbonCreditsToMint,
                            pricePerCredit: pricePerCredit || 15.0,
                        }
                    });
                }
            }

            await prisma.project.update({
                where: { id: report.projectId },
                data: { status: 'APPROVED' }
            });
        }

        const updatedReport = await prisma.report.update({
            where: { id: reportId as string },
            data: { status, onChainTxId, revisionNotes: revisionNotes || null }
        });

        if (status === 'REVISION_REQUESTED') {
            await prisma.project.update({
                where: { id: report.projectId },
                data: { status: 'REVISION_REQUESTED', revisionNotes: revisionNotes || null }
            });
        } else if (status === 'REJECTED') {
            await prisma.project.update({
                where: { id: report.projectId },
                data: { status: 'REJECTED' }
            });
        }

        // Log Action
        await prisma.auditLog.create({
            data: {
                adminId: req.user!.id,
                actionType: `REPORT_${status}`,
                targetId: reportId as string,
                details: `Report for project ${report.project.name} was ${status}. ${revisionNotes ? 'Notes: ' + revisionNotes : ''}`
            }
        });

        res.json(updatedReport);
    } catch (error) {
        console.error('Error verifying report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// --- Analytics & Logs ---
export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        const logs = await prisma.auditLog.findMany({
            include: { admin: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
            take: 100 // Limit for performance
        });
        res.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAnalytics = async (req: Request, res: Response) => {
    try {
        const [projectCount, approvedProjects, totalAreaAgg, creditsAgg, pendingReportsCount] = await Promise.all([
            prisma.project.count(),
            prisma.project.count({ where: { status: 'APPROVED' } }),
            prisma.project.aggregate({ _sum: { area: true }, where: { status: 'APPROVED' } }),
            prisma.carbonCredit.aggregate({ _sum: { amountTotal: true } }),
            prisma.report.count({ where: { status: 'PENDING' } })
        ]);

        res.json({
            totalProjects: projectCount,
            approvedProjects,
            totalAreaRestored: totalAreaAgg._sum.area || 0,
            carbonCreditsIssued: creditsAgg._sum.amountTotal || 0,
            pendingReports: pendingReportsCount
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
