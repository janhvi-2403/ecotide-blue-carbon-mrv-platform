import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { UploadCloud, File, AlertCircle } from 'lucide-react';

export const EvidenceUpload = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const { data } = await api.get('/projects');
                setProjects(data);
            } catch (error) {
                console.error('Failed to fetch projects');
            }
        };
        fetchProjects();
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProject || !file) {
            setMessage({ type: 'error', text: 'Please select a project and a file.' });
            return;
        }
        if (latitude) {
            const lat = parseFloat(latitude);
            if (isNaN(lat) || lat < -90 || lat > 90) {
                setMessage({ type: 'error', text: 'Validation Error: Latitude must be between -90 and 90.' });
                return;
            }
        }

        if (longitude) {
            const lng = parseFloat(longitude);
            if (isNaN(lng) || lng < -180 || lng > 180) {
                setMessage({ type: 'error', text: 'Validation Error: Longitude must be between -180 and 180.' });
                return;
            }
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('projectId', selectedProject);
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);
        formData.append('file', file);

        try {
            await api.post('/evidence/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage({ type: 'success', text: 'Evidence uploaded successfully to Cloudinary and IPFS.' });
            setFile(null);
            setLatitude('');
            setLongitude('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Upload failed.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Evidence Upload</h1>
                <p className="text-slate-400">Upload drone images, satellite data, or field photos for your projects.</p>
            </div>

            <div className="eco-card">
                {message.text && (
                    <div className={`p-4 rounded-md mb-6 flex items-start gap-3 ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>{message.text}</p>
                    </div>
                )}

                <form onSubmit={handleUpload} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Select Project</label>
                        <select
                            className="eco-input"
                            value={selectedProject}
                            onChange={(e) => {
                                const pId = e.target.value;
                                setSelectedProject(pId);
                                const proj = projects.find(p => p.id === pId);
                                if (proj) {
                                    setLatitude(proj.latitude?.toString() || '');
                                    setLongitude(proj.longitude?.toString() || '');
                                }
                            }}
                            required
                        >
                            <option value="" disabled>Choose a project...</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.status})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Latitude</label>
                            <input
                                type="number"
                                step="any"
                                min="-90"
                                max="90"
                                className="eco-input"
                                placeholder="e.g. 21.949"
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Longitude</label>
                            <input
                                type="number"
                                step="any"
                                min="-180"
                                max="180"
                                className="eco-input"
                                placeholder="e.g. 89.183"
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Evidence File</label>
                        <div className="border-2 border-dashed border-slate-700 rounded-xl p-10 text-center hover:bg-slate-800/50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                required
                                accept=".jpg,.jpeg,.png,.pdf,.mp4"
                            />
                            <UploadCloud className="w-10 h-10 text-slate-500 mx-auto mb-4" />

                            {file ? (
                                <div className="flex items-center justify-center gap-2 text-emerald-400">
                                    <File className="w-4 h-4" />
                                    <span className="font-medium">{file.name}</span>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-white font-medium mb-1">Upload evidence file</h3>
                                    <p className="text-sm text-slate-400">Drag & drop or click to browse</p>
                                    <p className="text-xs text-slate-500 mt-2">Supports JPG, PNG, PDF, MP4</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                        <button
                            type="submit"
                            disabled={loading || !file || !selectedProject}
                            className="eco-btn w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Uploading...' : 'Upload & Generate Hash'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
