import { createContext, useContext, useState, useEffect } from 'react';
import { getMeAPI, loginAPI, registerAPI, logoutAPI } from '../utils/api.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) { setLoading(false); return; }
            const { data } = await getMeAPI();
            if (data.success) setUser(data.user);
        } catch { localStorage.removeItem('token'); }
        finally { setLoading(false); }
    };

    const login = async (email, password) => {
        const { data } = await loginAPI({ email, password });
        if (data.success) {
            localStorage.setItem('token', 'session-active');
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
        }
        return data;
    };

    const register = async (name, email, password) => {
        const { data } = await registerAPI({ name, email, password });
        if (data.success) {
            localStorage.setItem('token', 'session-active');
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
        }
        return data;
    };

    const logout = async () => {
        try { await logoutAPI(); } catch { }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (userData) => setUser(prev => ({ ...prev, ...userData }));

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAdmin: user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
};
