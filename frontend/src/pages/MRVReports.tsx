import { useState, useEffect } from 'react';
import api from '../utils/api';
import { UploadCloud, AlertCircle, MapPin, Trees, ChevronRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { format } from 'date-fns';

// Leaflet Icon Fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map click handler component
function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (v: L.LatLng) => void }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

// Center updater when position changes manually
function MapCenterer({ position }: { position: L.LatLng | null }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);
    return null;
}

export const MRVReports = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form State
    const [formData, setFormData] = useState({
        projectId: '',
        uploaderRole: 'NGO',
        plantsCount: '',
        expectedCarbon: '',
        latitude: '',
        longitude: '',
        treeHeight: '',
        density: '',
        siteConditions: ''
    });
    const [file, setFile] = useState<File | null>(null);
    const [mapPosition, setMapPosition] = useState<L.LatLng | null>(null);

    const fetchData = async () => {
        try {
            const [projRes, repRes] = await Promise.all([
                api.get('/projects'),
                api.get('/reports')
            ]);
            setProjects(projRes.data);
            setReports(repRes.data);
        } catch (error) {
            console.error('Failed to fetch MRV data', error);
        }
    };

    useEffect(() => {
        fetchData();
        // Try getting user's current GPS location automatically
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setMapPosition(new L.LatLng(pos.coords.latitude, pos.coords.longitude)),
                (_err) => console.log('Geolocation not available/denied')
            );
        }
    }, []);

    // Sync map pin with manual inputs
    useEffect(() => {
        if (mapPosition) {
            setFormData(prev => ({
                ...prev,
                latitude: mapPosition.lat.toFixed(6),
                longitude: mapPosition.lng.toFixed(6)
            }));
        }
    }, [mapPosition]);

    const handleManualLatLng = (lat: string, lng: string) => {
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
        const numLat = parseFloat(lat);
        const numLng = parseFloat(lng);
        if (!isNaN(numLat) && !isNaN(numLng) && numLat >= -90 && numLat <= 90 && numLng >= -180 && numLng <= 180) {
            setMapPosition(new L.LatLng(numLat, numLng));
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.projectId || !file) {
            setMessage({ type: 'error', text: 'Please select a project and attach an evidence file.' });
            return;
        }

        // Validate Coordinates
        if (formData.latitude) {
            const lat = parseFloat(formData.latitude);
            if (isNaN(lat) || lat < -90 || lat > 90) {
                setMessage({ type: 'error', text: 'Latitude must be between -90 and 90.' });
                return;
            }
        }
        if (formData.longitude) {
            const lng = parseFloat(formData.longitude);
            if (isNaN(lng) || lng < -180 || lng > 180) {
                setMessage({ type: 'error', text: 'Longitude must be between -180 and 180.' });
                return;
            }
        }

        setLoading(true);
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value) data.append(key, value);
        });
        data.append('file', file);

        try {
            await api.post('/reports/mrv', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage({ type: 'success', text: 'MRV Report submitted successfully for Verification.' });

            // Reset Form but keep location
            setFormData({
                projectId: '', uploaderRole: 'NGO', plantsCount: '', expectedCarbon: '',
                latitude: formData.latitude, longitude: formData.longitude,
                treeHeight: '', density: '', siteConditions: ''
            });
            setFile(null);
            fetchData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Upload failed.' });
        } finally {
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">MRV Reports</h1>
                    <p className="text-slate-400">Submit Measurement, Reporting, and Verification data with GPS tagging.</p>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-md flex items-start gap-3 ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* FORM SECTION */}
                <div className="lg:col-span-7 space-y-6">
                    <form onSubmit={handleUpload} className="eco-card p-6 space-y-8">

                        {/* 1. General Info */}
                        <div>
                            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
                                <span className="bg-slate-800 text-slate-300 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                General Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5 caps-label">Target Project *</label>
                                    <select className="eco-input" value={formData.projectId} onChange={e => setFormData({ ...formData, projectId: e.target.value })} required>
                                        <option value="" disabled>Select project...</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5 caps-label">Uploader Role *</label>
                                    <select className="eco-input" value={formData.uploaderRole} onChange={e => setFormData({ ...formData, uploaderRole: e.target.value })} required>
                                        <option value="NGO">NGO / Non-Profit</option>
                                        <option value="Community">Local Community Member</option>
                                        <option value="Panchayat">Panchayat / Local Gov</option>
                                        <option value="Auditor">Independent Auditor</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 2. Plantation & Growth */}
                        <div>
                            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
                                <span className="bg-slate-800 text-slate-300 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                Plantation & Metrics
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5 caps-label">Plants Survived</label>
                                    <input type="number" className="eco-input" placeholder="e.g. 5000" value={formData.plantsCount} onChange={e => setFormData({ ...formData, plantsCount: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5 caps-label">Avg Height (cm)</label>
                                    <input type="number" step="0.1" className="eco-input" placeholder="e.g. 120.5" value={formData.treeHeight} onChange={e => setFormData({ ...formData, treeHeight: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5 caps-label">Density (plants/ha)</label>
                                    <input type="number" step="0.1" className="eco-input" placeholder="e.g. 2500" value={formData.density} onChange={e => setFormData({ ...formData, density: e.target.value })} />
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5 caps-label">Expected Carbon Seq. (Tons)</label>
                                    <input type="number" step="0.1" className="eco-input" placeholder="Estimate based on current growth..." value={formData.expectedCarbon} onChange={e => setFormData({ ...formData, expectedCarbon: e.target.value })} />
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5 caps-label">Site Conditions / Soil / Water Quality</label>
                                    <textarea rows={2} className="eco-input resize-none" placeholder="Describe soil salinity, water levels, damage..." value={formData.siteConditions} onChange={e => setFormData({ ...formData, siteConditions: e.target.value })}></textarea>
                                </div>
                            </div>
                        </div>

                        {/* 3. Evidende File */}
                        <div>
                            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
                                <span className="bg-slate-800 text-slate-300 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                Report Evidence *
                            </h3>
                            <div className="border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-xl p-6 text-center hover:bg-slate-800/80 transition-colors relative cursor-pointer group">
                                <input type="file" required onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                <UploadCloud className="w-8 h-8 text-slate-500 mx-auto mb-2 group-hover:text-emerald-500 transition-colors" />
                                {file ? (
                                    <div className="text-emerald-400 font-medium truncate px-4">{file.name}</div>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-white">Upload Assessment Document / Photo</p>
                                        <p className="text-xs text-slate-500 mt-1">Hashes will be generated and pinned to IPFS</p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800">
                            <button type="submit" disabled={loading} className="eco-btn w-full justify-center text-lg py-3 shadow-lg shadow-emerald-500/20">
                                {loading ? 'Processing & Uploading...' : 'Submit MRV Data for Verification'}
                            </button>
                        </div>

                    </form>
                </div>

                {/* MAP & TRACKING SECTION */}
                <div className="lg:col-span-5 space-y-6">

                    {/* GPS Tagging Card */}
                    <div className="eco-card p-0 overflow-hidden flex flex-col h-[400px]">
                        <div className="p-4 bg-slate-800/80 border-b border-slate-700">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-eco-primary" /> GPS Tagging
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Click the map to drop a pin, or enter manually.</p>
                        </div>

                        <div className="flex-1 w-full bg-slate-900 relative z-0">
                            <MapContainer
                                center={[21.94, 89.18]}
                                zoom={6}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                />
                                <LocationMarker position={mapPosition} setPosition={setMapPosition} />
                                <MapCenterer position={mapPosition} />
                            </MapContainer>
                        </div>

                        <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex gap-4">
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Latitude</label>
                                <input type="number" step="any" className="w-full bg-slate-900 border border-slate-700 rounded text-sm text-white px-2 py-1 outline-none focus:border-emerald-500"
                                    value={formData.latitude}
                                    onChange={e => handleManualLatLng(e.target.value, formData.longitude)} />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Longitude</label>
                                <input type="number" step="any" className="w-full bg-slate-900 border border-slate-700 rounded text-sm text-white px-2 py-1 outline-none focus:border-emerald-500"
                                    value={formData.longitude}
                                    onChange={e => handleManualLatLng(formData.latitude, e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Status Tracker */}
                    <div className="eco-card">
                        <h3 className="text-md font-bold text-white mb-4 border-b border-slate-800 pb-3">My Submissions</h3>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {reports.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">No MRV reports submitted yet.</p>
                            ) : (
                                reports.map(r => (
                                    <div key={r.id} className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-medium text-sm text-white">{r.project?.name || 'Unknown Project'}</div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                                                r.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                                                    'bg-red-500/10 text-red-400'
                                                }`}>
                                                {r.status}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-2">
                                            {r.plantsCount && <div><Trees className="w-3 h-3 inline mr-1 text-emerald-500" />{r.plantsCount} plants</div>}
                                            {r.latitude && <div><MapPin className="w-3 h-3 inline mr-1 text-blue-400" />{r.latitude}, {r.longitude}</div>}
                                            {r.expectedCarbon && <div>Carbon: {r.expectedCarbon}T</div>}
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-slate-800/50">
                                            <span className="text-[10px] text-slate-500">{format(new Date(r.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                                            <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-[10px] text-eco-primary hover:underline flex items-center gap-1">
                                                View Evidence <ChevronRight className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
