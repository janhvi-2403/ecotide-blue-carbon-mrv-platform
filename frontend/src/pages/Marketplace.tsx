import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Store, ShoppingCart, Leaf, MapPin, CheckCircle, AlertCircle, Briefcase, Award, Building, Wallet, Activity } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { format } from 'date-fns';
import { PeraWalletConnect } from '@perawallet/connect';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export const Marketplace = () => {
    const [activeTab, setActiveTab] = useState<'MARKET' | 'PORTFOLIO'>('MARKET');

    const [projects, setProjects] = useState<any[]>([]);
    const [portfolio, setPortfolio] = useState<any[]>([]);
    const [metrics, setMetrics] = useState({ totalCreditsBought: 0 });

    // Payment Modal State
    const [checkoutModal, setCheckoutModal] = useState<{ isOpen: boolean, creditId: string, available: number, price: number, amount: number, totalCostUsd: number, totalCostInr: number } | null>(null);
    const [peraWallet, setPeraWallet] = useState<PeraWalletConnect | null>(null);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const { user } = useAuthStore();

    useEffect(() => {
        // Initialize Pera Wallet
        const wallet = new PeraWalletConnect();
        setPeraWallet(wallet);
        wallet.reconnectSession().then((accounts) => {
            if (wallet.connector?.accounts.length) {
                setWalletAddress(accounts[0]);
            }
        });

        fetchMarketplace();
        if (user?.role === 'BUYER') {
            fetchPortfolio();
        }

        return () => {
            wallet.disconnect();
        };
    }, [user]);

    const fetchMarketplace = async () => {
        try {
            const { data } = await api.get('/marketplace/projects');
            setProjects(data);
        } catch (error) {
            console.error('Failed to fetch marketplace projects');
        }
    };

    const fetchPortfolio = async () => {
        try {
            const { data } = await api.get('/marketplace/portfolio');
            setPortfolio(data.transactions);
            setMetrics(data.metrics);
        } catch (error) {
            console.error('Failed to fetch portfolio');
        }
    };

    const initiateCheckout = (creditId: string, available: number, price: number) => {
        const amountStr = prompt(`How many credits would you like to buy?\nAvailable: ${available}\nPrice: $${price} / credit`);
        if (!amountStr) return;

        const amount = Number(amountStr);
        if (isNaN(amount) || amount <= 0 || amount > available) {
            setMessage({ type: 'error', text: 'Invalid amount entered.' });
            return;
        }

        const totalCostUsd = amount * price;
        const totalCostInr = Math.round(totalCostUsd * 80); // Mock Conversion

        setCheckoutModal({
            isOpen: true,
            creditId,
            available,
            price,
            amount,
            totalCostUsd,
            totalCostInr
        });
    };

    const handlePayPalCapture = async (orderID: string) => {
        if (!checkoutModal) return;
        try {
            await api.post('/payments/paypal/capture', {
                orderID,
                creditId: checkoutModal.creditId,
                amountToPurchase: checkoutModal.amount
            });

            setMessage({ type: 'success', text: `Successfully purchased ${checkoutModal.amount} Carbon Credits using PayPal!` });
            setCheckoutModal(null);
            fetchMarketplace();
            fetchPortfolio();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'PayPal verification failed.' });
        }
    };

    const handleCryptoPayment = async () => {
        if (!checkoutModal || !peraWallet) return;
        setLoading(true);
        try {
            // 1. Connect Wallet if not connected
            let address = walletAddress;
            if (!address) {
                const accounts = await peraWallet.connect();
                address = accounts[0];
                setWalletAddress(address);
                setMessage({ type: 'success', text: `Wallet connected: ${address.substring(0, 8)}...` });
            }

            // 2. Simulate Smart Contract Transfer (Since we don't have ALGO keys injected)
            setMessage({ type: 'success', text: `Simulating Pera Wallet signature & ALGO transfer...` });

            setTimeout(async () => {
                try {
                    // 3. Send mock TxHash to backend for verification
                    await api.post('/payments/crypto/verify', {
                        txId: `PERA_TX_${Date.now()}`,
                        creditId: checkoutModal.creditId,
                        amountToPurchase: checkoutModal.amount,
                    });

                    setMessage({ type: 'success', text: `Successfully purchased ${checkoutModal.amount} Carbon Credits using Pera Wallet!` });
                    setCheckoutModal(null);
                    fetchMarketplace();
                    fetchPortfolio();
                } catch (err: any) {
                    setMessage({ type: 'error', text: err.response?.data?.error || 'Crypto Verification failed.' });
                } finally {
                    setLoading(false);
                }
            }, 2500);

        } catch (error: any) {
            setMessage({ type: 'error', text: error?.message || 'Failed to connect Pera Wallet.' });
            setLoading(false);
        }
    };

    const printCertificate = (tx: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to generate offsets certificate.');
            return;
        }

        const html = `
            <html>
                <head>
                    <title>Carbon Offset Certificate - ${tx.id}</title>
                    <style>
                        body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #1e293b; padding: 40px; display: flex; justify-content: center;}
                        .certificate { border: 15px solid #10b981; padding: 50px; text-align: center; max-width: 800px; width: 100%; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); position: relative; overflow: hidden; }
                        .certificate::before { content: '≈'; position: absolute; font-size: 400px; color: #10b981; opacity: 0.05; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 0; }
                        .content { position: relative; z-index: 1; }
                        h1 { color: #0f172a; font-size: 3em; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;}
                        h2 { color: #10b981; font-weight: 300; font-size: 1.5em; margin-bottom: 40px;}
                        p { font-size: 1.2em; line-height: 1.6; color: #475569; }
                        .highlight { font-weight: bold; color: #0f172a; font-size: 1.2em;}
                        .hash { font-family: monospace; background: #f1f5f9; padding: 5px 10px; border-radius: 4px; font-size: 0.9em; word-break: break-all;}
                        .footer { margin-top: 50px; border-top: 2px solid #e2e8f0; padding-top: 20px; font-size: 0.9em; color: #94a3b8;}
                    </style>
                </head>
                <body>
                    <div class="certificate">
                        <div class="content">
                            <h1>Certificate of Carbon Offset</h1>
                            <h2>EcoTide Blue Carbon Initiative</h2>
                            <p>This is to certify that</p>
                            <p class="highlight">${user?.name}</p>
                            <p>has successfully purchased and permanently retired</p>
                            <p class="highlight text-eco-primary" style="font-size: 2em; color: #10b981;">${tx.amount} Voluntary Carbon Credits</p>
                            <p>from the verified blue carbon restoration project:</p>
                            <p class="highlight">${tx.credit.project.name} (${tx.credit.project.location})</p>
                            <br/>
                            <p style="text-align: left; font-size: 0.95em;">
                                <strong>Date of Issuance:</strong> ${format(new Date(tx.createdAt), 'MMMM dd, yyyy')}<br/>
                                <strong>Payment Method:</strong> ${tx.paymentMethod === 'RAZORPAY' ? 'Fiat (INR)' : tx.paymentMethod === 'PERA_WALLET' ? 'Crypto (ALGO)' : 'Simulated'}<br/>
                                <strong>Algorand TX Hash:</strong> <span class="hash">${tx.txHash}</span><br/>
                                <strong>Asset ID:</strong> <span class="hash">${tx.credit.tokenAssetId || 'N/A'}</span>
                            </p>
                            <div class="footer">
                                Verified by EcoTide MRV Systems • Powered by Algorand Blockchain
                            </div>
                        </div>
                    </div>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Building className="w-8 h-8 text-eco-primary" /> Corporate Buyer Dashboard
                    </h1>
                    <p className="text-slate-400">Discover verified blue carbon projects, purchase ASA tokens, and generate offset certificates.</p>
                </div>
                {user?.role === 'BUYER' && (
                    <div className="bg-slate-800 px-6 py-3 rounded-xl border border-emerald-500/30 flex items-center gap-4 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <Leaf className="text-emerald-400 w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider mb-1">Total Offset Portfolio</p>
                            <p className="text-2xl font-bold text-white leading-none">{metrics.totalCreditsBought} <span className="text-sm font-normal text-slate-400">Credits</span></p>
                        </div>
                    </div>
                )}
            </div>

            {/* Buyer Tabs */}
            <div className="flex gap-1 overflow-x-auto border-b border-slate-800 mb-6 pb-px custom-scrollbar">
                {[
                    { id: 'MARKET', label: 'Marketplace', icon: Store },
                    { id: 'PORTFOLIO', label: 'My Portfolio & Certificates', icon: Briefcase },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-eco-primary text-eco-primary bg-emerald-500/5' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                    {message.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
                    <p className="flex-1 font-medium">{message.text}</p>
                </div>
            )}

            {/* Tab: Marketplace */}
            {activeTab === 'MARKET' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.flatMap(p => p.carbonCredits.filter((c: any) => c.amountAvailable > 0).map((credit: any) => (
                        <div key={credit.id} className="eco-card flex flex-col hover:border-emerald-500/40 hover:shadow-[0_4px_20px_rgba(16,185,129,0.1)] transition-all group overflow-hidden relative">
                            {/* Mock project image background */}
                            <div className="absolute top-0 left-0 w-full h-32 bg-slate-800 overlay-image opacity-30 group-hover:opacity-40 transition-opacity" style={{ backgroundImage: 'linear-gradient(to bottom, transparent, #0f172a), url("https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80")' }}></div>

                            <div className="mb-4 relative z-10 pt-4">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-xl font-bold text-white leading-tight drop-shadow-md">{p.name}</h3>
                                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wide uppercase border border-emerald-500/30">
                                        Verified
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-2">
                                    <MapPin className="w-4 h-4 text-slate-400" /> {p.location}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded border border-slate-700">{p.species}</span>
                                    <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded border border-slate-700">{p.area} Hectares</span>
                                </div>
                            </div>

                            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-5 mb-5 border border-slate-700/50 relative z-10 flex-1 flex flex-col justify-center">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-slate-400 text-sm font-medium">Available Supply</span>
                                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xl">
                                        {credit.amountAvailable} <span className="text-xs font-normal text-slate-500">Credits</span>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-900 rounded-full h-2 mb-2 border border-slate-700">
                                    <div
                                        className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-2 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                        style={{ width: `${(credit.amountAvailable / credit.amountTotal) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-[11px] text-slate-500 font-medium tracking-wide">
                                    <span>Issued: {credit.amountTotal}</span>
                                    <span>Token: {credit.tokenAssetId || 'Pending'}</span>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Target Price</span>
                                    <span className="text-white font-bold text-xl">${credit.pricePerCredit}<span className="text-sm font-normal text-slate-500">/tCO2e</span></span>
                                </div>
                            </div>

                            <div className="mt-auto relative z-10">
                                <button
                                    onClick={() => initiateCheckout(credit.id, credit.amountAvailable, credit.pricePerCredit)}
                                    disabled={loading || user?.role !== 'BUYER'}
                                    className="w-full eco-btn py-3 text-base font-semibold flex items-center justify-center gap-2 group-hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {user?.role === 'BUYER' ? 'Purchase Carbon Credits' : 'View Only (Buyers)'}
                                </button>
                            </div>
                        </div>
                    )))}

                    {projects.flatMap(p => p.carbonCredits || []).length === 0 && (
                        <div className="col-span-full py-24 text-center eco-card border-dashed border-slate-700/50 bg-slate-800/20">
                            <Leaf className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-medium text-slate-300 mb-2">Marketplace is Waiting for Data</h3>
                            <p className="text-slate-500 max-w-lg mx-auto mb-6">
                                The marketplace is currently empty because we cleared the dummy data.
                                To see credits here:
                                <br /><br />
                                <span className="text-sm block text-slate-400">
                                    1. A <b>Worker</b> must create a project and submit reports.
                                    <br />
                                    2. An <b>Admin</b> must approve the project.
                                    <br />
                                    3. Only then will the Carbon Credits appear here for purchase.
                                </span>
                            </p>
                            <div className="inline-flex items-center gap-2 text-eco-primary font-bold animate-pulse">
                                <Activity className="w-4 h-4" /> Real-time Blockchain Registry Active
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Portfolio */}
            {activeTab === 'PORTFOLIO' && (
                <div className="space-y-6">
                    {portfolio.length === 0 ? (
                        <div className="py-24 text-center eco-card border-dashed border-slate-700/50 bg-slate-800/20">
                            <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-medium text-slate-300 mb-2">Your Portfolio is Empty</h3>
                            <p className="text-slate-500 max-w-md mx-auto">You haven't purchased any carbon credits yet. Browse the marketplace to start offsetting your carbon footprint.</p>
                        </div>
                    ) : (
                        <div className="eco-card p-0 overflow-hidden border-slate-700/50">
                            <div className="p-6 bg-slate-800/50 border-b border-slate-700/50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">Purchased Carbon Credits</h2>
                                    <p className="text-sm text-slate-400">View your transaction history and download official offset certificates.</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-400">
                                    <thead className="bg-slate-900/80 text-slate-400 tracking-wider text-xs uppercase font-semibold">
                                        <tr>
                                            <th className="px-6 py-4">Transaction Date</th>
                                            <th className="px-6 py-4">Project</th>
                                            <th className="px-6 py-4 text-center">Amount Bought</th>
                                            <th className="px-6 py-4">Algorand TxHash</th>
                                            <th className="px-6 py-4 text-right">Certificate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {portfolio.map(tx => (
                                            <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors group">
                                                <td className="px-6 py-5 whitespace-nowrap">{format(new Date(tx.createdAt), 'MMM dd, yyyy HH:mm')}</td>
                                                <td className="px-6 py-5">
                                                    <p className="font-bold text-slate-200">{tx.credit.project.name}</p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{tx.credit.project.location}</p>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className="bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-sm">
                                                        {tx.amount} CC
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="font-mono text-xs text-blue-400 bg-blue-500/5 px-2 py-1 rounded border border-blue-500/10 block w-40 truncate" title={tx.txHash}>
                                                        {tx.txHash}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <button onClick={() => printCertificate(tx)} className="text-sm px-4 py-2 rounded-lg bg-slate-800 hover:bg-emerald-600 text-white font-medium transition-colors border border-slate-700 hover:border-emerald-500 shadow-sm flex items-center gap-2 ml-auto">
                                                        <Award className="w-4 h-4" /> Download
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {/* Payment Modal */}
            {checkoutModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
                        <button
                            onClick={() => setCheckoutModal(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            X
                        </button>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                <ShoppingCart className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Complete Purchase</h2>
                            <p className="text-slate-400 mt-1">Select your preferred payment method.</p>
                        </div>

                        <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700/50">
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-400">Carbon Credits:</span>
                                <span className="text-white font-bold">{checkoutModal.amount} ASA</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-400">Total in Fiat:</span>
                                <span className="text-white font-bold">${checkoutModal.totalCostUsd} (₹{checkoutModal.totalCostInr})</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Total in Crypto:</span>
                                <span className="text-white font-bold">~{Number(checkoutModal.totalCostUsd / 0.20).toFixed(2)} ALGO</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <PayPalScriptProvider options={{ clientId: "sb", currency: "USD" }}>
                                <PayPalButtons
                                    style={{ layout: "vertical", shape: "pill", color: "gold", height: 45 }}
                                    createOrder={async () => {
                                        try {
                                            const { data } = await api.post('/payments/paypal/create-order', {
                                                creditId: checkoutModal.creditId,
                                                amountToPurchase: checkoutModal.amount
                                            });

                                            if (data.isMock) {
                                                setMessage({ type: 'success', text: 'Simulating PayPal Payment Success (Development Mode)...' });
                                                setTimeout(() => handlePayPalCapture(data.id), 2000);
                                                return data.id;
                                            }
                                            return data.id;
                                        } catch (err) {
                                            setMessage({ type: 'error', text: 'Failed to create PayPal order' });
                                            return "";
                                        }
                                    }}
                                    onApprove={async (data) => {
                                        handlePayPalCapture(data.orderID);
                                    }}
                                    onError={(err) => {
                                        console.error("PayPal Error:", err);
                                        // If it fails with "test" id, it might just be the UI rendering
                                    }}
                                />
                            </PayPalScriptProvider>

                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-slate-800"></div>
                                <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase font-bold">Or</span>
                                <div className="flex-grow border-t border-slate-800"></div>
                            </div>

                            <button
                                onClick={handleCryptoPayment}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-xl font-bold transition-all border border-slate-700 disabled:opacity-50"
                            >
                                <Wallet className="w-5 h-5 text-emerald-400" />
                                {walletAddress ? `Pay with Pera Wallet (${walletAddress.substring(0, 4)}...)` : 'Connect & Pay with Pera'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
