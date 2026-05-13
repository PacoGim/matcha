import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    username: string;
}

interface AuthContextType {
    user: User | null;
    login: (user: User) => void;
    logout: (message?: string) => void;
    isAuthenticated: boolean;
    isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const endpoint_profile = `${process.env.REACT_APP_BACKEND_ORIGIN || window.location.origin}/user/profile`
                const response = await fetch(endpoint_profile, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
            } finally {
                setIsInitializing(false);
            }
        };

        loadUser();
    }, []);

    const login = (userData: User) => {
        setUser(userData);
    };

    const logout = (message: string = "") => {
        setUser(null);
        window.location.assign("/")
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isInitializing,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};