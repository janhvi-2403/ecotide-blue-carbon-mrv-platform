import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileUp, ClipboardCheck, Store, LogOut, PlusCircle, FileText, Map } from 'lucide-react';
import clsx from 'clsx';

export const Layout = ({ children }: { children: React.ReactNode }) => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['UPLOADER'] },
        { name: 'Projects', path: '/projects', icon: FileText, roles: ['UPLOADER'] },
        { name: 'New Project', path: '/projects/new', icon: PlusCircle, roles: ['UPLOADER'] },
        { name: 'Evidence Upload', path: '/evidence', icon: FileUp, roles: ['UPLOADER'] },
        { name: 'Evidence Dashboard', path: '/evidence/dashboard', icon: LayoutDashboard, roles: ['UPLOADER'] },
        { name: 'Evidence Map', path: '/evidence/map', icon: Map, roles: ['UPLOADER'] },
        { name: 'MRV Reports', path: '/mrv-reports', icon: ClipboardCheck, roles: ['UPLOADER'] },
        { name: 'Admin Dashboard', path: '/admin', icon: ClipboardCheck, roles: ['ADMIN'] },
        { name: 'Marketplace', path: '/marketplace', icon: Store, roles: ['BUYER', 'ADMIN'] },
    ].filter(item => item.roles.includes(user?.role || ''));

    return (
        <div className="h-screen w-screen bg-eco-dark flex overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto">
                <div className="p-6 sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10 hidden md:block">
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
                        <div className="w-8 h-8 rounded-md bg-emerald-500/20 flex items-center justify-center">
                            <span className="text-eco-primary">≈</span>
                        </div>
                        EcoTide
                    </h1>
                </div>

                <div className="px-4 py-2 border-b border-slate-800 hidden md:block">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-slate-800/50">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium text-emerald-400">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate capitalize">{user?.role?.toLowerCase()}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.path)}
                                className={clsx(
                                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-eco-primary text-white"
                                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                                )}
                            >
                                <Icon className="w-5 h-5 shrink-0" />
                                <span>{item.name}</span>
                            </button>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-y-auto w-full bg-[#0a0f18] relative">
                {children}
            </main>
        </div>
    );
};
