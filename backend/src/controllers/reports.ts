import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import crypto from 'crypto';
import { uploadToCloudinary } from '../services/cloudinary';
import { uploadToPinata } from '../services/pinata';

/**
 * Submit an MRV (Monitoring, Reporting, Verification) Report
 */
export const submitMRVReport = async (req: Request, res: Response) => {
    try {
        const uploaderId = req.user?.id;
        if (!uploaderId) return res.status(401).json({ error: 'Unauthorized' });

        const file = req.file;
        if (!file) return res.status(400).json({ error: 'Evidence file is required for the MRV report' });

        const {
            projectId,
            uploaderRole,
            plantsCount,
            expectedCarbon,
            latitude,
            longitude,
            treeHeight,
            density,
            siteConditions
        } = req.body;

        if (!projectId) return res.status(400).json({ error: 'Project ID is required' });

        // Generate SHA256 Hash of the file
        const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

        // Check if report hash already exists
        const existingReport = await prisma.report.findUnique({ where: { hash } });
        if (existingReport) return res.status(400).json({ error: 'This exact report file has already been uploaded' });

        // Upload to Cloudinary
        const fileUrl = await uploadToCloudinary(file.buffer, 'reports');

        // Optional: Upload to IPFS (Not failing if it errors)
        let ipfsCid = null;
        try {
            ipfsCid = await uploadToPinata(file.buffer, `mrv_${hash.slice(0, 8)}`);
        } catch (ipfsError) {
            console.warn('IPFS pinning for report failed, continuing...', ipfsError);
        }

        // Save to Database
        const report = await prisma.report.create({
            data: {
                projectId,
                uploaderId,
                fileUrl,
                hash,
                uploaderRole,
                plantsCount: plantsCount ? parseInt(plantsCount) : null,
                expectedCarbon: expectedCarbon ? parseFloat(expectedCarbon) : null,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                treeHeight: treeHeight ? parseFloat(treeHeight) : null,
                density: density ? parseFloat(density) : null,
                siteConditions,
                status: 'PENDING'
            }
        });

        res.status(201).json({
            message: 'MRV Report submitted successfully for verification.',
            report,
            ipfs_cid: ipfsCid
        });

    } catch (error: any) {
        console.error('Error submitting MRV report:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

/**
 * Fetch all reports (User sees theirs, Admin sees all)
 */
export const getReports = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        let reports;

        if (user?.role === 'ADMIN') {
            reports = await prisma.report.findMany({
                include: { project: true, uploader: { select: { name: true, email: true } } },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            reports = await prisma.report.findMany({
                where: { uploaderId: user?.id },
                include: { project: true },
                orderBy: { createdAt: 'desc' }
            });
        }

        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
