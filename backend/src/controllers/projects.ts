import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const createProject = async (req: Request, res: Response) => {
    try {
        const { name, location, area, latitude, longitude, species, startDate, description } = req.body;
        const uploaderId = req.user?.id;

        if (!uploaderId) {
            return res.status(401).json({ error: 'User ID missing' });
        }

        const project = await prisma.project.create({
            data: {
                name,
                location,
                area: parseFloat(area),
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                species,
                startDate: new Date(startDate),
                description,
                uploaderId,
                status: 'DRAFT',
            },
        });

        res.status(201).json(project);
    } catch (error: any) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

export const updateProject = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { name, location, area, latitude, longitude, species, startDate, description } = req.body;
        const uploaderId = req.user?.id;

        const project = await prisma.project.findUnique({ where: { id } });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (project.uploaderId !== uploaderId && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden: You do not own this project and you are not an admin' });
        }

        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                name,
                location,
                area: area ? parseFloat(area) : project.area,
                latitude: latitude !== undefined ? (latitude ? parseFloat(latitude) : null) : project.latitude,
                longitude: longitude !== undefined ? (longitude ? parseFloat(longitude) : null) : project.longitude,
                species,
                startDate: startDate ? new Date(startDate) : project.startDate,
                description,
            },
        });

        res.json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const uploaderId = req.user?.id;

        const project = await prisma.project.findUnique({ where: { id } });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (project.uploaderId !== uploaderId) {
            return res.status(403).json({ error: 'Forbidden: You do not own this project' });
        }

        await prisma.project.delete({ where: { id } });

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getProjects = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'User context missing' });
        }

        let projects;

        if (user.role === 'UPLOADER') {
            // Uploader sees only their projects
            projects = await prisma.project.findMany({
                where: { uploaderId: user.id },
                include: { evidence: true, reports: true },
                orderBy: { createdAt: 'desc' }
            });
        } else if (user.role === 'ADMIN') {
            // Admin sees ALL projects
            projects = await prisma.project.findMany({
                include: { uploader: { select: { name: true, email: true } }, evidence: true, reports: true },
                orderBy: { createdAt: 'desc' }
            });
        } else if (user.role === 'BUYER') {
            // Buyers only see APPROVED projects with carbon credits
            projects = await prisma.project.findMany({
                where: { status: 'APPROVED' },
                include: { carbonCredits: true },
                orderBy: { createdAt: 'desc' }
            });
        }

        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({
            where: { id: id as string },
            include: {
                evidence: true,
                reports: true,
                carbonCredits: true,
                uploader: { select: { name: true, email: true } }
            }
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateProjectStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // DRAFT, SUBMITTED

        const project = await prisma.project.update({
            where: { id: id as string },
            data: { status }
        });

        res.json(project);
    } catch (error) {
        console.error('Error updating project status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
