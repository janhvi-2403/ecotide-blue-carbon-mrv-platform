import fs from 'fs';
import path from 'path';

// Generate consistent mock hash since crypto.createHash('sha256') struggles with large files directly in memory
// In production, we would use streams, but we're keeping it simple for dev
import crypto from 'crypto';

export const generateFileHash = (filePath: string): string => {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
};
