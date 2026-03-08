import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { uploadToCloudinary } from '../services/cloudinary';
import { uploadToPinata } from '../services/pinata';
import { generateSHA256 } from '../services/hash';

export const uploadEvidence = async (req: Request, res: Response) => {
    try {
        const projectId = req.body.projectId as string;
        const latitude = req.body.latitude;
        const longitude = req.body.longitude;
        const file = req.file;
        const uploaderId = req.user?.id as string;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('DEBUG: Uploading file:', file.originalname, 'mimetype:', file.mimetype, 'size:', file.size);
        console.log('DEBUG: Buffer length:', file.buffer?.length);

        if (!uploaderId) {
            return res.status(401).json({ error: 'User ID missing' });
        }

        if (!projectId) {
            return res.status(400).json({ error: 'Project ID missing' });
        }

        // 1. Generate SHA256 hash
        let hashValue;
        try {
            console.log('DEBUG: Starting hash generation...');
            hashValue = generateSHA256(file.buffer);
            console.log('DEBUG: Hash generated:', hashValue);
        } catch (err: any) {
            console.error('DEBUG: Hashing failed:', err);
            return res.status(500).json({ error: 'Failed to generate hash', details: err.message });
        }

        // 2. Upload to Cloudinary
        const fileUrl = await uploadToCloudinary(file.buffer);

        // 3. Upload to IPFS via Pinata
        let ipfsCid = null;
        try {
            ipfsCid = await uploadToPinata(file.buffer, file.originalname);
        } catch (error) {
            console.error('IPFS upload failed, proceeding without CID:', error);
            // We proceed because Cloudinary is our primary storage for now
        }

        // 4. Store metadata in SQLite
        const evidence = await prisma.evidence.create({
            data: {
                projectId,
                uploaderId,
                fileName: file.originalname,
                fileType: file.mimetype,
                fileUrl,
                ipfsCid,
                latitude: latitude ? parseFloat(latitude as string) : null,
                longitude: longitude ? parseFloat(longitude as string) : null,
                hashValue,
            },
        });

        res.status(201).json({
            success: true,
            evidence,
            file_url: fileUrl,
            ipfs_cid: ipfsCid,
            hash: hashValue,
        });
    } catch (error: any) {
        console.error('Evidence upload error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

export const getEvidenceByProject = async (req: Request, res: Response) => {
    try {
        const projectId = req.params.projectId as string;
        const evidence = await prisma.evidence.findMany({
            where: { projectId },
            include: { uploader: { select: { name: true } } },
            orderBy: { uploadedAt: 'desc' },
        });
        res.json(evidence);
    } catch (error) {
        console.error('Error fetching evidence:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteEvidence = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const uploaderId = req.user?.id;

        const evidence = await prisma.evidence.findUnique({ where: { id } });

        if (!evidence) {
            return res.status(404).json({ error: 'Evidence not found' });
        }

        if (evidence.uploaderId !== uploaderId && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden: You do not own this evidence' });
        }

        await prisma.evidence.delete({ where: { id } });
        res.json({ message: 'Evidence deleted successfully' });
    } catch (error) {
        console.error('Error deleting evidence:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Get all evidence (for Admin/Map)
 */
export const getAllEvidence = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        let evidence;

        if (user?.role === 'ADMIN') {
            evidence = await prisma.evidence.findMany({
                include: {
                    project: { select: { name: true } },
                    uploader: { select: { name: true } }
                },
                orderBy: { uploadedAt: 'desc' },
            });
        } else {
            // Uploader sees only their own evidence across all projects
            evidence = await prisma.evidence.findMany({
                where: { uploaderId: user?.id },
                include: {
                    project: { select: { name: true } }
                },
                orderBy: { uploadedAt: 'desc' },
            });
        }

        res.json(evidence);
    } catch (error) {
        console.error('Error fetching all evidence:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
