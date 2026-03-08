import { useState, useEffect } from 'react';
import api from '../utils/api';
import {
    Users, Activity, FolderOpen, ShieldCheck, Download,
    Leaf, Settings, CheckCircle, XCircle, Search, Map as MapIcon, Database, ExternalLink, FileText, ClipboardCheck, ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Sub-Components (Usually would be in separate files, kept here for brevity) ---

const AnalyticsTab = ({ stats, logs }: any) => {
    // Mock Trend Data for the Admin
    const trendData = [
        { month: 'Oct', credits: 120 }, { month: 'Nov', credits: 450 },
        { month: 'Dec', credits: 800 }, { month: 'Jan', credits: 1250 },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="eco-card">
                    <div className="text-slate-400 text-sm mb-1">Total Projects</div>
                    <div className="text-3xl font-bold text-white mb-2">{stats.totalProjects}</div>
                    <div className="text-xs text-emerald-400">Active restoration sites</div>
                </div>
                <div className="eco-card">
                    <div className="text-slate-400 text-sm mb-1">Pending MRV Reports</div>
                    <div className="text-3xl font-bold text-amber-400 mb-2">{stats.pendingReports}</div>
                    <div className="text-xs text-amber-500/70">Awaiting your verification</div>
                </div>
                <div className="eco-card">
                    <div className="text-slate-400 text-sm mb-1">Total Area Restored</div>
                    <div className="text-3xl font-bold text-white mb-2">{stats.totalAreaRestored} ha</div>
                    <div className="text-xs text-blue-400">Verified ecological impact</div>
                </div>
                <div className="eco-card border-emerald-500/30">
                    <div className="text-emerald-400 text-sm mb-1">Carbon Credits Minted</div>
                    <div className="text-3xl font-bold text-emerald-400 mb-2">{stats.carbonCreditsIssued}</div>
                    <div className="text-xs text-emerald-500/50">Total ASA Tokens on Algorand</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="eco-card h-80">
                    <h3 className="text-start text-white font-medium mb-4">Carbon Credit Issuance Trend</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorCreds" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                            <Area type="monotone" dataKey="credits" stroke="#10b981" fillOpacity={1} fill="url(#colorCreds)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="eco-card overflow-hidden flex flex-col h-80">
                    <h3 className="text-start text-white font-medium mb-4">Recent System Activity</h3>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        {logs.length > 0 ? logs.map((log: any) => (
                            <div key={log.id} className="text-sm bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-white font-medium">{log.admin?.name || 'System'}</span>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-tighter">{format(new Date(log.createdAt), 'MMM dd, HH:mm')}</span>
                                </div>
                                <span className="text-slate-400">{log.details}</span>
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-900/20 border border-dashed border-slate-800 rounded-lg">
                                <Database className="w-8 h-8 text-slate-700 mb-2" />
                                <p className="text-slate-500 text-xs">No activity logs found. Real actions like user registration and project approvals will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {stats.totalProjects === 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-8 text-center animate-in fade-in zoom-in duration-700">
                    <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome to your clean Environment!</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto mb-6">
                        Since we cleared the dummy data for security, you'll need to follow these steps to see the platform in action.
                        This is a <span className="text-eco-primary font-bold">Role-Based System</span>, so you must switch roles to populate the data.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-start">
                        <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800">
                            <span className="text-emerald-500 font-bold text-xl block mb-2">1. Register Workers</span>
                            <p className="text-sm text-slate-400">Sign out and create a new account as an <b>NGO / Worker</b> with your own email.</p>
                        </div>
                        <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800">
                            <span className="text-emerald-500 font-bold text-xl block mb-2">2. Upload Proofs</span>
                            <p className="text-sm text-slate-400">Create a project as a Worker and upload evidence. It will automatically show up here for you to approve.</p>
                        </div>
                        <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800">
                            <span className="text-emerald-500 font-bold text-xl block mb-2">3. Mint Credits</span>
                            <p className="text-sm text-slate-400">Log back in as Admin, click "Approve" on the reports, and they will move to the Marketplace for Buyers.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main Dashboard Component ---

export const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('ANALYTICS');

    // Data States
    const [stats, setStats] = useState({ totalProjects: 0, pendingReports: 0, totalAreaRestored: 0, carbonCreditsIssued: 0 });
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]); // Contains projects and nested reports
    const [selectedReport, setSelectedReport] = useState<any | null>(null);
    const [creditsToMint, setCreditsToMint] = useState<number>(0);
    const [pricePerCredit, setPricePerCredit] = useState<number>(15);

    // Edit Project Meta State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<any>(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        location: '',
        area: '',
        species: '',
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (selectedReport) {
            setCreditsToMint(selectedReport.expectedCarbon || 0);
        }
    }, [selectedReport]);

    const fetchData = async () => {
        try {
            const [statRes, logRes, userRes, projRes] = await Promise.all([
                api.get('/admin/analytics'),
                api.get('/admin/audit-logs'),
                api.get('/admin/users'),
                api.get('/projects') // Recycled from existing endpoints
            ]);
            setStats(statRes.data);
            setAuditLogs(logRes.data);
            setUsers(userRes.data);
            setProjects(projRes.data);
        } catch (error) {
            console.error('Admin data fetch failed', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handlers
    const toggleUser = async (id: string, currentStatus: boolean) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) return;
        try {
            await api.put(`/admin/users/${id}/toggle`, { isActive: !currentStatus });
            fetchData();
        } catch (error) {
            alert('Failed to toggle user status');
        }
    };

    const handleVerifyReport = async (reportId: string, status: string, notes: string = '', credits: number = 0) => {
        setLoading(true);
        try {
            await api.post(`/admin/verify-report/${reportId}`, {
                status,
                revisionNotes: notes,
                carbonCreditsToMint: credits,
                pricePerCredit: pricePerCredit
            });
            await fetchData();
            setSelectedReport(null);
            setCreditsToMint(0);
            setMessage({ type: 'success', text: `Report successfully ${status === 'APPROVED' ? 'approved and credits issued' : status.toLowerCase()}` });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            console.error('Verification failed', error);
            setMessage({ type: 'error', text: 'Verification action failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEditModal = (project: any) => {
        setEditingProject(project);
        setEditFormData({
            name: project.name,
            location: project.location,
            area: project.area.toString(),
            species: project.species || '',
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEditMeta = async () => {
        setLoading(true);
        try {
            await api.put(`/projects/${editingProject.id}`, editFormData);
            await fetchData();
            setIsEditModalOpen(false);
            setMessage({ type: 'success', text: 'Project metadata updated successfully' });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            console.error('Update failed', error);
            setMessage({ type: 'error', text: 'Failed to update project metadata' });
        } finally {
            setLoading(false);
        }
    };

    // Derived Data
    const pendingReports = projects.flatMap(p => (p.reports || []).map((r: any) => ({ ...r, project: p }))).filter(r => r.status === 'PENDING');

    return (
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-screen flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-eco-primary" /> Admin Operations Hub
                    </h1>
                    <p className="text-slate-400">Manage MRV verifications, users, blockchain assets, and system audits.</p>
                </div>
                <button onClick={() => window.print()} className="eco-btn py-2 px-4 text-sm flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border-slate-700">
                    <Download className="w-4 h-4" /> Export Report
                </button>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-4 ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                    {message.type === 'error' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    <span className="font-medium text-sm">{message.text}</span>
                </div>
            )}

            {/* Admin Tabs */}
            <div className="flex gap-1 overflow-x-auto border-b border-slate-800 mb-6 pb-px custom-scrollbar">
                {[
                    { id: 'ANALYTICS', label: 'Overview', icon: Activity },
                    { id: 'MRV_REVIEWS', label: `Pending Reviews (${pendingReports.length})`, icon: CheckCircle },
                    { id: 'PROJECTS', label: 'All Projects', icon: FolderOpen },
                    { id: 'USERS', label: 'Users', icon: Users },
                    { id: 'AUDIT', label: 'Audit Logs', icon: Database }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-eco-primary text-eco-primary bg-emerald-500/5' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content Area */}
            <div className="flex-1">
                {activeTab === 'ANALYTICS' && <AnalyticsTab stats={stats} logs={auditLogs} />}

                {activeTab === 'USERS' && (
                    <div className="eco-card p-0 overflow-hidden">
                        <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
                            <h2 className="text-white font-medium">User Management</h2>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input type="text" placeholder="Search users..." className="bg-slate-900 border border-slate-700 rounded-md py-1.5 pl-9 pr-3 text-sm text-white focus:border-eco-primary outline-none" />
                            </div>
                        </div>
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-900/50 text-slate-500 text-xs uppercase font-medium">
                                <tr>
                                    <th className="px-5 py-3">Name</th>
                                    <th className="px-5 py-3">Email</th>
                                    <th className="px-5 py-3">Role</th>
                                    <th className="px-5 py-3">Joined</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-800/30">
                                        <td className="px-5 py-4 font-medium text-slate-300">{u.name}</td>
                                        <td className="px-5 py-4">{u.email}</td>
                                        <td className="px-5 py-4"><span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs">{u.role}</span></td>
                                        <td className="px-5 py-4">{format(new Date(u.createdAt), 'MMM dd, yyyy')}</td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {u.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button onClick={() => toggleUser(u.id, u.isActive)} className={`text-xs px-3 py-1.5 rounded border ${u.isActive ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'}`}>
                                                {u.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'MRV_REVIEWS' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-4 duration-500">
                        <div className="lg:col-span-1 space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest px-1 mb-4">Pending Reports Queue</h2>
                            {pendingReports.length === 0 ? (
                                <div className="text-center p-8 text-slate-500 eco-card border-dashed">No pending reviews.</div>
                            ) : pendingReports.map(report => (
                                <div
                                    key={report.id}
                                    onClick={() => setSelectedReport(report)}
                                    className={`eco-card p-4 hover:border-slate-600 cursor-pointer transition-all ${selectedReport?.id === report.id ? 'ring-2 ring-eco-primary border-eco-primary' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-2 text-xs">
                                        <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold uppercase">{report.uploaderRole}</span>
                                        <span className="text-slate-500 font-medium">{format(new Date(report.createdAt), 'PP')}</span>
                                    </div>
                                    <h3 className="text-white font-medium mb-1 truncate">{report.project.name}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>Click to inspect evidence</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="lg:col-span-2">
                            {selectedReport ? (
                                <div className="eco-card h-full flex flex-col animate-in fade-in duration-300">
                                    <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-white mb-1">Verify MRV Data</h2>
                                            <p className="text-sm text-slate-400">Reviewing evidence for <span className="text-white font-medium">{selectedReport.project.name}</span></p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Report Hash:</span>
                                            <span className="font-mono text-[10px] bg-slate-900 px-2 py-1 rounded text-emerald-500 border border-slate-800" title={selectedReport.hash}>
                                                {selectedReport.hash.substring(0, 16)}...
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                                <Activity className="w-3.5 h-3.5" /> Filed Metrics
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400 text-sm">Plants Tracked</span>
                                                    <span className="text-white text-sm font-bold">{selectedReport.plantsCount || 'N/A'} units</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400 text-sm">Avg Tree Height</span>
                                                    <span className="text-white text-sm font-bold">{selectedReport.treeHeight || 'N/A'} cm</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400 text-sm">Latitude/Longitude</span>
                                                    <span className="text-white text-sm font-bold">{selectedReport.latitude}, {selectedReport.longitude}</span>
                                                </div>
                                                <div className="flex justify-between p-2 bg-emerald-500/10 rounded border border-emerald-500/20">
                                                    <span className="text-emerald-400 text-sm font-semibold">Requested Credits</span>
                                                    <span className="text-emerald-400 text-sm font-bold">{selectedReport.expectedCarbon || 0} tCO2e</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                                <FileText className="w-3.5 h-3.5" /> Evidence
                                            </h4>
                                            <div className="space-y-3">
                                                <a
                                                    href={`http://localhost:5000${selectedReport.fileUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors group"
                                                >
                                                    <span className="text-xs text-white truncate max-w-[150px]">{selectedReport.fileUrl.split('/').pop()}</span>
                                                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-eco-primary" />
                                                </a>
                                                <p className="text-[10px] text-slate-500 italic">Verify the hash of this file against the on-chain registry before approval.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Decision Area */}
                                    <div className="mt-auto bg-slate-900/80 p-6 rounded-2xl border border-emerald-500/20 shadow-xl">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Leaf className="w-5 h-5 text-emerald-500" />
                                            <h3 className="text-white font-bold">On-Chain Certification & Minting</h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Credits to Issue (tCO2e)</label>
                                                <input
                                                    type="number"
                                                    className="eco-input w-full bg-slate-950"
                                                    placeholder="Amount to mint"
                                                    value={creditsToMint}
                                                    onChange={(e) => setCreditsToMint(Number(e.target.value))}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Price Per Credit (USD)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                                    <input
                                                        type="number"
                                                        className="eco-input w-full bg-slate-950 pl-7"
                                                        placeholder="e.g. 25"
                                                        value={pricePerCredit}
                                                        onChange={(e) => setPricePerCredit(Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <button
                                                onClick={() => handleVerifyReport(selectedReport.id, 'REJECTED')}
                                                disabled={loading}
                                                className="flex-1 py-3 px-6 rounded-xl border border-red-500/30 text-red-500 font-bold hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4" /> Reject Report
                                            </button>
                                            <button
                                                onClick={() => handleVerifyReport(selectedReport.id, 'APPROVED', '', creditsToMint)}
                                                disabled={loading || creditsToMint <= 0}
                                                className="flex-1 eco-btn py-3 px-6 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                                            >
                                                {loading ? 'Executing Blockchain Tx...' : (
                                                    <>
                                                        <ShieldCheck className="w-5 h-5" /> Approve & Issue Credits
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="eco-card h-full flex flex-col items-center justify-center text-center border-dashed border-slate-700 min-h-[400px]">
                                    <ClipboardCheck className="w-12 h-12 text-slate-700 mb-4" />
                                    <h3 className="text-lg font-bold text-white mb-1">Select a Report for Review</h3>
                                    <p className="text-slate-500 text-sm max-w-sm px-4">Detailed MRV metrics, Map coordinates, Evidence hashes, and Minting workflows will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'PROJECTS' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(p => (
                            <div key={p.id} className="eco-card flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-slate-200">{p.name}</h3>
                                    <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold ${p.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : p.status === 'REVISION_REQUESTED' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                                        {p.status}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400 mb-4">{p.location} • {p.area}ha</p>
                                <div className="mt-auto pt-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between">
                                    <span>{p.reports?.length || 0} Reports</span>
                                    <button
                                        onClick={() => handleOpenEditModal(p)}
                                        className="text-eco-primary hover:underline"
                                    >
                                        Edit Meta
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'AUDIT' && (
                    <div className="eco-card p-0">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-900/50 text-slate-500 text-xs uppercase font-medium">
                                <tr>
                                    <th className="px-5 py-3">Timestamp</th>
                                    <th className="px-5 py-3">Admin</th>
                                    <th className="px-5 py-3">Action Type</th>
                                    <th className="px-5 py-3">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {auditLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-800/30">
                                        <td className="px-5 py-4 whitespace-nowrap">{format(new Date(log.createdAt), 'MMM dd, HH:mm:ss')}</td>
                                        <td className="px-5 py-4 font-medium text-slate-300">{log.admin?.name || 'UnknownAdmin'}</td>
                                        <td className="px-5 py-4"><span className="font-mono text-[10px] bg-slate-800 px-2 py-1 rounded text-blue-400">{log.actionType}</span></td>
                                        <td className="px-5 py-4">{log.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Meta Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="eco-card w-full max-w-md border-eco-primary/30 shadow-2xl shadow-eco-primary/10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Settings className="w-5 h-5 text-eco-primary" />
                                Edit Project Meta
                            </h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-white">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Project Name</label>
                                <input
                                    type="text"
                                    className="eco-input w-full"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Location</label>
                                <input
                                    type="text"
                                    className="eco-input w-full"
                                    value={editFormData.location}
                                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Area (ha)</label>
                                    <input
                                        type="number"
                                        className="eco-input w-full"
                                        value={editFormData.area}
                                        onChange={(e) => setEditFormData({ ...editFormData, area: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Species</label>
                                    <input
                                        type="text"
                                        className="eco-input w-full"
                                        value={editFormData.species}
                                        onChange={(e) => setEditFormData({ ...editFormData, species: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-medium hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEditMeta}
                                disabled={loading}
                                className="flex-1 eco-btn py-2.5"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
