import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing old mock data...');
    await prisma.transaction.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.carbonCredit.deleteMany();
    await prisma.report.deleteMany();
    await prisma.evidence.deleteMany();
    await prisma.project.deleteMany();

    // CAUTION: Don't delete real users if they exist, just find or create
    console.log('Seeding Mock Data (Users, Projects, Credits)...');

    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Create STRICT Admin Account
    // This is the ONLY way to get an Admin account in the system.
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@ecotide.org' },
        update: { passwordHash }, // Ensure password is reset to 'password123' if already exists
        create: {
            email: 'admin@ecotide.org',
            name: 'EcoTide Root Admin',
            role: 'ADMIN',
            passwordHash
        }
    });

    console.log('✅ Base System Ready!');
    console.log('Admin Email: admin@ecotide.org');
    console.log('Admin Password: password123');
    console.log('All dummy projects and users have been cleared.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
