import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { FileText, MapPin, Trees, Calendar, ArrowLeft, Save, Send, Target } from 'lucide-react';

export const CreateProject = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        latitude: '',
        longitude: '',
        area: '',
        species: '',
        startDate: '',
        description: ''
    });

    useEffect(() => {
        if (isEditMode && id) {
            const fetchProject = async () => {
                try {
                    const { data } = await api.get(`/projects/${id}`);
                    setFormData({
                        name: data.name,
                        location: data.location,
                        latitude: data.latitude?.toString() || '',
                        longitude: data.longitude?.toString() || '',
                        area: data.area.toString(),
                        species: data.species,
                        startDate: data.startDate.split('T')[0],
                        description: data.description
                    });
                } catch (error) {
                    console.error("Failed to fetch project details");
                    navigate('/projects');
                } finally {
                    setFetching(false);
                }
            };
            fetchProject();
        }
    }, [id, isEditMode, navigate]);

    const handleSubmit = async (isDraft: boolean) => {
        if (formData.latitude) {
            const lat = parseFloat(formData.latitude);
            if (isNaN(lat) || lat < -90 || lat > 90) {
                alert('Validation Error: Latitude must be between -90 and 90.');
                return;
            }
        }
        if (formData.longitude) {
            const lng = parseFloat(formData.longitude);
            if (isNaN(lng) || lng < -180 || lng > 180) {
                alert('Validation Error: Longitude must be between -180 and 180.');
                return;
            }
        }

        setLoading(true);
        try {
            let projectId = id;

            // Clean data before sending
            const cleanData: any = { ...formData };
            if (cleanData.latitude === '') delete cleanData.latitude;
            if (cleanData.longitude === '') delete cleanData.longitude;

            if (isEditMode) {
                await api.put(`/projects/${id}`, cleanData);
            } else {
                const { data } = await api.post('/projects', cleanData);
                projectId = data.id;
            }

            if (!isDraft) {
                // Auto-submit if requested
                await api.patch(`/projects/${projectId}/status`, { status: 'SUBMITTED' });
            }

            navigate('/projects');
        } catch (error: any) {
            console.error("Failed to save project", error);
            const errorMessage = error.response?.data?.details || error.response?.data?.error || "Error saving project. Please check your inputs.";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude.toFixed(6),
                    longitude: position.coords.longitude.toFixed(6)
                }));
                setLoading(false);
            },
            (error) => {
                console.error("Error detecting location:", error);
                alert("Unable to retrieve your location. Check browser permissions.");
                setLoading(false);
            }
        );
    };

    if (fetching) {
        return (
            <div className="p-8 flex justify-center items-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eco-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-2">
                <button
                    onClick={() => navigate('/projects')}
                    className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {isEditMode ? 'Edit Project' : 'Create New Project'}
                    </h1>
                    <p className="text-slate-400">
                        {isEditMode ? `Updating ${formData.name}` : 'Register a new blue carbon restoration project'}
                    </p>
                </div>
            </div>

            <div className="eco-card overflow-visible">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-700/50">
                    <FileText className="w-5 h-5 text-eco-primary" />
                    <h2 className="text-lg font-semibold text-white">Project Details</h2>
                </div>

                <form id="project-form" className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-1.5 caps-label">Project Name *</label>
                            <input name="name" onChange={handleChange} value={formData.name} required className="eco-input" placeholder="e.g., Sundarbans Mangrove Restoration" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center justify-between text-sm font-medium text-slate-400 mb-1.5 caps-label">
                                <span className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-eco-primary" /> Location Name *
                                </span>
                                <button
                                    type="button"
                                    onClick={detectLocation}
                                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-eco-primary px-2 py-1 rounded border border-slate-700 flex items-center gap-1 transition-colors"
                                >
                                    <Target className="w-3 h-3" /> Detect My GPS
                                </button>
                            </label>
                            <input name="location" onChange={handleChange} value={formData.location} required className="eco-input" placeholder="e.g., West Bengal, India" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5 caps-label">Latitude</label>
                            <input name="latitude" type="number" step="0.000001" min="-90" max="90" onChange={handleChange} value={formData.latitude} className="eco-input" placeholder="21.949" />
                            <p className="text-xs text-slate-500 mt-1">Must be between -90 and 90.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5 caps-label">Longitude</label>
                            <input name="longitude" type="number" step="0.000001" min="-180" max="180" onChange={handleChange} value={formData.longitude} className="eco-input" placeholder="89.183" />
                            <p className="text-xs text-slate-500 mt-1">Must be between -180 and 180.</p>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-1.5 caps-label">
                                <span className="text-eco-primary">📐</span> Area (hectares) *
                            </label>
                            <input name="area" type="number" step="0.01" min="0.01" onChange={handleChange} value={formData.area} required className="eco-input" placeholder="e.g., 250" />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-1.5 caps-label">
                                <Trees className="w-4 h-4 text-emerald-500" /> Species
                            </label>
                            <input name="species" onChange={handleChange} value={formData.species} className="eco-input" placeholder="e.g., Rhizophora mucronata" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-1.5 caps-label">
                                <Calendar className="w-4 h-4 text-eco-primary" /> Start Date *
                            </label>
                            <input name="startDate" type="date" onChange={handleChange} value={formData.startDate} required className="eco-input" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-1.5 caps-label">Description *</label>
                            <textarea name="description" onChange={handleChange} value={formData.description} required rows={4} className="eco-input resize-none" placeholder="Describe the project goals, methodology, and expected outcomes..."></textarea>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-700/50">
                        <button
                            type="button"
                            onClick={() => {
                                const form = document.getElementById('project-form') as HTMLFormElement;
                                if (form.checkValidity()) {
                                    handleSubmit(true);
                                } else {
                                    form.reportValidity();
                                }
                            }}
                            disabled={loading}
                            className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 px-6 rounded-md transition-all flex items-center justify-center gap-2 border border-slate-700 grow"
                        >
                            <Save className="w-4 h-4 text-slate-400" />
                            {isEditMode ? 'Update Draft' : 'Save as Draft'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const form = document.getElementById('project-form') as HTMLFormElement;
                                if (form.checkValidity()) {
                                    handleSubmit(false);
                                } else {
                                    form.reportValidity();
                                }
                            }}
                            disabled={loading}
                            className="eco-btn flex items-center justify-center gap-2 grow shadow-lg shadow-emerald-500/20"
                        >
                            <Send className="w-4 h-4" />
                            {isEditMode ? 'Update & Submit' : 'Submit for Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
