import crypto from 'crypto';

/**
 * Generates a SHA256 hash of a file buffer.
 * @param buffer The file buffer to hash.
 * @returns The hex string representation of the hash.
 */
export const generateSHA256 = (buffer: Buffer): string => {
    return crypto.createHash('sha256').update(buffer).digest('hex');
};
