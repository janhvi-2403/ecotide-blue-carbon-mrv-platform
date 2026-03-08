import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../utils/api';
import { format } from 'date-fns';
import { MapPin } from 'lucide-react';

// Fix for default Leaflet marker icons not showing in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom colored icons
const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const center: [number, number] = [21.949, 89.183]; // Default center

export const EvidenceMap = () => {
    const [evidence, setEvidence] = useState<any[]>([]);

    useEffect(() => {
        const fetchEvidence = async () => {
            try {
                const { data } = await api.get('/evidence');
                // Filter items with coordinates
                setEvidence(data.filter((e: any) => e.latitude && e.longitude));
            } catch (error) {
                console.error('Failed to fetch evidence for map');
            }
        };
        fetchEvidence();
    }, []);

    const getIcon = (type: string) => {
        if (type.includes('image')) return greenIcon;
        if (type.includes('video')) return blueIcon;
        return redIcon;
    };

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2 text-right">Evidence Map Visualization</h1>
                <p className="text-slate-400 text-right">Geolocated evidence markers for blue carbon restoration sites using OpenStreetMap.</p>
            </div>

            <div className="eco-card p-2 h-[calc(100vh-220px)] w-full relative z-0">
                <MapContainer
                    center={evidence.length > 0 ? [evidence[0].latitude, evidence[0].longitude] : center}
                    zoom={5}
                    style={{ height: '100%', width: '100%', borderRadius: '8px' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {evidence.map((item) => (
                        <Marker
                            key={item.id}
                            position={[item.latitude, item.longitude]}
                            icon={getIcon(item.fileType)}
                        >
                            <Popup className="custom-popup">
                                <div className="p-1 max-w-[200px]">
                                    {item.fileType.includes('image') && (
                                        <img src={item.fileUrl} alt="" className="w-full h-28 object-cover rounded mb-2 border border-slate-200" />
                                    )}
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-sm text-emerald-600 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {item.project?.name || 'Untitled Project'}
                                        </h4>
                                        <p className="text-xs text-slate-600 line-clamp-1">{item.fileName}</p>
                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                                            <span className="text-[10px] text-slate-400">
                                                {format(new Date(item.uploadedAt), 'MMM dd, yyyy')}
                                            </span>
                                            <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline">
                                                View Full
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-400 bg-slate-900/50 p-4 rounded-lg border border-slate-800 w-fit">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#2aad27]"></div>
                    <span>Photos</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#2b82cb]"></div>
                    <span>Videos</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#cb2b3e]"></div>
                    <span>Other</span>
                </div>
            </div>
        </div>
    );
};
