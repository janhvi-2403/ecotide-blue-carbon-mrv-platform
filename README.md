<<<<<<< HEAD
# ecotide-blue-carbon-mrv-platform
EcoTide is a decentralized platform designed to streamline the lifecycle of Blue Carbon credits. It connects coastal restoration workers with corporate buyers through a transparent, high-integrity MRV (Measurement, Reporting, and Verification) system.
=======
# EcoTide: Blockchain-Powered Blue Carbon Marketplace 🌊

**EcoTide** is a decentralized platform designed to streamline the lifecycle of Blue Carbon credits. It connects coastal restoration workers with corporate buyers through a transparent, high-integrity MRV (Measurement, Reporting, and Verification) system.

## 🚀 Key Features
*   🏗️ **Project Lifecycle**: Streamlined registration, evidence submission, and admin verification.
*   🛰️ **Smart MRV**: Built-in evidence tracking with automated metadata capture and IPFS storage.
*   ⛓️ **Blockchain Settlement**: Carbon credits are minted and transferred as **Algorand Standard Assets (ASAs)**.
*   💳 **Dual-Payment System**: Integrated **PayPal** (Fiat) and **Algorand** (Pera Wallet) support.
*   📜 **Automated Certificates**: Verified carbon offset certificates generated upon successful transactions.

## 🛠️ Tech Stack
*   **Frontend**: React, Vite, Tailwind CSS, Zustand.
*   **Backend**: Node.js, Express, Prisma (SQLite).
*   **Integrations**: Algorand SDK, PayPal SDK, Cloudinary, Pinata (IPFS).

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- NPM or Yarn

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/janhvi-2403/ecotide-blue-carbon-mrv-platform.git

# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup
Create a `.env` file in the `backend/` directory with the following keys:
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_secret"

# Integrations
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
PINATA_JWT="..."
PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
```

### 4. Running the App
```bash
# Start Backend (from backend/ directory)
npm run dev

# Start Frontend (from frontend/ directory)
npm run dev
```

---
*Empowering coastal restoration through transparent, blockchain-verified carbon offsetting.*
>>>>>>> 997e83a (Add root README with project description and setup instructions)
