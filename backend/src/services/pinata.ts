import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Uploads a file buffer to Pinata IPFS.
 * @param buffer The file buffer.
 * @param fileName The name of the file for Pinata metadata.
 * @returns The CID of the uploaded file.
 */
export const uploadToPinata = async (buffer: Buffer, fileName: string): Promise<string> => {
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const data = new FormData();
    data.append('file', buffer, { filename: fileName });

    const metadata = JSON.stringify({
        name: fileName,
        keyvalues: {
            app: 'EcoTide-MRV'
        }
    });
    data.append('pinataMetadata', metadata);

    const options = JSON.stringify({
        cidVersion: 0,
    });
    data.append('pinataOptions', options);

    try {
        const response = await axios.post(url, data, {
            headers: {
                ...data.getHeaders(),
                'Authorization': `Bearer ${process.env.PINATA_JWT}`
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });

        return response.data.IpfsHash; // Pinata returns the CID as IpfsHash
    } catch (error: any) {
        console.error('Pinata upload error:', error.response?.data || error.message);
        throw new Error('Failed to upload to IPFS via Pinata');
    }
};
