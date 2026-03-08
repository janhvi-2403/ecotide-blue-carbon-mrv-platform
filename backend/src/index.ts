import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/auth';
import projectsRoutes from './routes/projects';
import evidenceRoutes from './routes/evidence';
import reportsRoutes from './routes/reports';
import adminRoutes from './routes/admin';
import marketplaceRoutes from './routes/marketplace';
import paymentRoutes from './routes/payment';
dotenv.config();
console.log('Environment Loaded:', {
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL ? 'PRESENT' : 'MISSING',
    JWT_SECRET: process.env.JWT_SECRET ? 'PRESENT' : 'MISSING'
});

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('EcoTide API Server');
});

// We will add routes here later

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
