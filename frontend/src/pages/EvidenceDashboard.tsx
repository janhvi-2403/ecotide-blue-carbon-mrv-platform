import { useState, useEffect } from 'react';
import api from '../utils/api';
import { FileText, Image as ImageIcon, Video, Trash2, ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const EvidenceDashboard = () => {
    const [evidence, setEvidence] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvidence = async () => {
            try {
                const { data } = await api.get('/evidence');
                setEvidence(data);
            } catch (error) {
                console.error('Failed to fetch evidence');
            } finally {
                setLoading(false);
            }
        };
        fetchEvidence();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this evidence?')) return;
        try {
            await api.delete(`/evidence/${id}`);
            setEvidence(evidence.filter(e => e.id !== id));
        } catch (error) {
            alert('Failed to delete evidence');
        }
    };

    const getFileIcon = (type: string) => {
        if (type.includes('image')) return <ImageIcon className="w-5 h-5 text-emerald-400" />;
        if (type.includes('video')) return <Video className="w-5 h-5 text-blue-400" />;
        return <FileText className="w-5 h-5 text-slate-400" />;
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Evidence Dashboard</h1>
                <p className="text-slate-400">Manage and track restoration evidence uploaded for your projects.</p>
            </div>

            {/* Evidence Table */}
            <div className="eco-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Preview</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">File / Project</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {evidence.length > 0 ? evidence.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="w-16 h-12 rounded-md bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                                            {item.fileType.includes('image') ? (
                                                <img src={item.fileUrl} alt={item.fileName} className="w-full h-full object-cover" />
                                            ) : item.fileType.includes('video') ? (
                                                <video src={item.fileUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <FileText className="w-6 h-6 text-slate-500" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-white flex items-center gap-2">
                                                {getFileIcon(item.fileType)}
                                                {item.fileName}
                                            </span>
                                            <span className="text-xs text-slate-500 mt-1">Project: {item.project?.name || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-slate-400">
                                            {item.latitude && item.longitude ? (
                                                <span>Lat: {item.latitude.toFixed(4)}, Lon: {item.longitude.toFixed(4)}</span>
                                            ) : (
                                                'No GPS data'
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        {format(new Date(item.uploadedAt), 'MMM dd, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <a
                                                href={item.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-slate-400 hover:text-white transition-colors"
                                                title="View Source"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No evidence found. Start by uploading some!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Timeline View (Simplified) */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-eco-primary" />
                    Activity Timeline
                </h2>
                <div className="relative border-l-2 border-slate-800 ml-3 space-y-8 py-4">
                    {evidence.map((item) => (
                        <div key={item.id} className="relative pl-8">
                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-eco-primary border-4 border-eco-dark shadow-lg shadow-eco-primary/20"></div>
                            <div className="eco-card p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-eco-primary uppercase tracking-wider">
                                        {item.fileType.split('/')[1].toUpperCase()} Added
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {format(new Date(item.uploadedAt), 'HH:mm aaa')}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-300">
                                    <span className="text-white font-medium">{item.fileName}</span> was uploaded for project
                                    <span className="text-eco-primary italic"> {item.project?.name}</span>.
                                </p>
                                <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                                    <span>CID: {item.ipfsCid ? item.ipfsCid.substring(0, 10) + '...' : 'N/A'}</span>
                                    <span>HASH: {item.hashValue.substring(0, 10) + '...'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
