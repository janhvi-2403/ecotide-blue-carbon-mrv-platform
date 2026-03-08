import { useState, useEffect } from 'react';
import api from '../utils/api';
import { CheckCircle, XCircle, FileText, ExternalLink, Leaf, Database, ClipboardCheck } from 'lucide-react';

export const AdminVerification = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState<any | null>(null);
    const [creditsToMint, setCreditsToMint] = useState<number>(0);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data } = await api.get('/projects');
            setProjects(data);
        } catch (error) {
            console.error('Failed to fetch projects');
        }
    };

    const handleVerify = async (reportId: string, status: string) => {
        setLoading(true);
        try {
            await api.post(`/admin/verify-report/${reportId}`, {
                status,
                carbonCreditsToMint: status === 'APPROVED' ? creditsToMint : 0
            });
            setSelectedReport(null);
            fetchProjects(); // refresh list
        } catch (error) {
            console.error('Failed to verify report');
        } finally {
            setLoading(false);
        }
    };

    // Flatten reports for easier mapping
    const pendingReports = projects.flatMap(p =>
        p.reports.map((r: any) => ({ ...r, project: p }))
    ).filter(r => r.status === 'PENDING');

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Authority Verification Panel</h1>
                <p className="text-slate-400">Review MRV reports, store verified hashes on Algorand, and mint Carbon Credits.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Reports Queue */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-lg font-semibold text-white px-1">Pending Reviews ({pendingReports.length})</h2>

                    {pendingReports.map(report => (
                        <div
                            key={report.id}
                            onClick={() => setSelectedReport(report)}
                            className={`eco-card cursor-pointer transition-all ${selectedReport?.id === report.id ? 'ring-2 ring-eco-primary border-eco-primary' : 'hover:border-slate-600'}`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-slate-200">{report.project.name}</h3>
                                <span className="bg-amber-500/10 text-amber-400 text-xs px-2 py-1 rounded-full font-medium">Pending</span>
                            </div>
                            <p className="text-sm text-slate-400 mb-2 truncate">Uploader: {report.project.uploader?.name}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <FileText className="w-3 h-3" />
                                {report.fileUrl.split('/').pop()}
                            </div>
                        </div>
                    ))}

                    {pendingReports.length === 0 && (
                        <div className="eco-card text-center py-12 border-dashed border-slate-700">
                            <CheckCircle className="w-8 h-8 text-emerald-500/50 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm">No pending reports to review.</p>
                        </div>
                    )}
                </div>

                {/* Verification Detail Panel */}
                <div className="lg:col-span-2">
                    {selectedReport ? (
                        <div className="eco-card h-full flex flex-col">
                            <div className="border-b border-slate-800 pb-4 mb-6">
                                <h2 className="text-xl font-bold text-white mb-1">Verify MRV Report</h2>
                                <p className="text-sm text-slate-400">Project: {selectedReport.project.name}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 text-sm">
                                <div>
                                    <h4 className="font-medium text-slate-500 mb-1">Uploader Role</h4>
                                    <p className="text-emerald-400 font-medium">{selectedReport.uploaderRole || 'Unknown'}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-500 mb-1">Project Area / Species</h4>
                                    <p className="text-slate-200">{selectedReport.project.area} ha • {selectedReport.project.species}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-500 mb-1">Plants Survived</h4>
                                    <p className="text-slate-200">{selectedReport.plantsCount ? `${selectedReport.plantsCount} plants` : 'N/A'}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-500 mb-1">Density & Height</h4>
                                    <p className="text-slate-200">{selectedReport.density || '?'} /ha • {selectedReport.treeHeight || '?'}cm</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-500 mb-1">GPS Coordinates</h4>
                                    <p className="text-slate-200">{selectedReport.latitude ? `${selectedReport.latitude}, ${selectedReport.longitude}` : 'Not Provided'}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-500 mb-1">Expected Carbon Match</h4>
                                    <p className="text-slate-200">{selectedReport.expectedCarbon ? `${selectedReport.expectedCarbon} Tons` : 'N/A'}</p>
                                </div>
                                <div className="col-span-2 mt-2">
                                    <h4 className="font-medium text-slate-500 mb-1">Site Conditions</h4>
                                    <p className="text-slate-300 italic bg-slate-800/30 p-2 rounded">{selectedReport.siteConditions || 'No additional remarks provided.'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="col-span-2">
                                    <h4 className="text-sm font-medium text-slate-500 mb-2">Report Document File</h4>
                                    <a href={`http://localhost:5000${selectedReport.fileUrl}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-md bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-eco-primary" />
                                            <span className="text-sm text-slate-300 font-medium">{selectedReport.fileUrl.split('/').pop()}</span>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-eco-primary transition-colors" />
                                    </a>
                                </div>
                                <div className="col-span-2">
                                    <h4 className="text-sm font-medium text-slate-500 mb-1">SHA256 File Hash</h4>
                                    <p className="font-mono text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20 break-all">
                                        {selectedReport.hash}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 mt-auto">
                                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                    <Leaf className="w-4 h-4 text-emerald-500" />
                                    Carbon Credit Issuance
                                </h3>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Credits to Mint (ASA Tokens)</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            className="eco-input max-w-[200px]"
                                            value={creditsToMint}
                                            onChange={(e) => setCreditsToMint(Number(e.target.value))}
                                            placeholder="e.g., 500"
                                        />
                                        <span className="text-sm text-slate-400">tCO2e</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Approving will store the report hash on the Algorand blockchain and mint {creditsToMint || 0} ASA tokens.</p>
                                </div>

                                <div className="flex gap-4 border-t border-slate-700 pt-5">
                                    <button
                                        onClick={() => handleVerify(selectedReport.id, 'REJECTED')}
                                        disabled={loading}
                                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-red-400 font-medium py-2.5 px-4 rounded-md transition-colors border border-slate-700 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <XCircle className="w-4 h-4" /> Reject Report
                                    </button>
                                    <button
                                        onClick={() => handleVerify(selectedReport.id, 'APPROVED')}
                                        disabled={loading || creditsToMint <= 0}
                                        className="flex-1 eco-btn flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? 'Processing Blockchain Tx...' : (
                                            <>
                                                <Database className="w-4 h-4" /> Approve & Mint
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="eco-card h-full min-h-[500px] flex flex-col items-center justify-center text-center border-dashed border-slate-700">
                            <ClipboardCheck className="w-12 h-12 text-slate-600 mb-4" />
                            <h3 className="text-lg font-medium text-slate-300 mb-1">Select a Report</h3>
                            <p className="text-slate-500 text-sm max-w-sm">Choose a pending MRV report from the queue to review evidence and issue carbon credits.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
