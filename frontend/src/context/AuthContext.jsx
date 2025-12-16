import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            // Decode token to get user info (or fetch from /me endpoint if we had one)
            // For now, we'll decode the JWT payload manually or just trust it until 401
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                // Check expiration
                if (payload.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser({ email: payload.sub, role: payload.role });
                }
            } catch (e) {
                console.error("Invalid token", e);
                logout();
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const response = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Login failed');
            }

            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            setToken(data.access_token);

            // Decode to set user immediately
            const payload = JSON.parse(atob(data.access_token.split('.')[1]));
            setUser({ email: payload.sub, role: payload.role });

            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch('http://localhost:8000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Registration failed');
            }

            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            setToken(data.access_token);
            // Decode to set user immediately
            const payload = JSON.parse(atob(data.access_token.split('.')[1]));
            setUser({ email: payload.sub, role: payload.role });

            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, token }}>
            {children}
        </AuthContext.Provider>
    );
};
