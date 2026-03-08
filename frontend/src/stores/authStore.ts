import { create } from 'zustand';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'UPLOADER' | 'ADMIN' | 'BUYER';
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    restoreSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    login: (user, token) => {
        localStorage.setItem('ecotide_token', token);
        localStorage.setItem('ecotide_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
    },

    logout: () => {
        localStorage.removeItem('ecotide_token');
        localStorage.removeItem('ecotide_user');
        set({ user: null, token: null, isAuthenticated: false });
    },

    restoreSession: () => {
        const token = localStorage.getItem('ecotide_token');
        const userStr = localStorage.getItem('ecotide_user');
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                set({ user, token, isAuthenticated: true });
            } catch (e) {
                localStorage.removeItem('ecotide_token');
                localStorage.removeItem('ecotide_user');
            }
        }
    }
}));
