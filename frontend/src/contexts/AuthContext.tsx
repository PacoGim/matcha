import React, { createContext, useContext, useState, useEffect } from 'react';

import type { BaseUserType } from '../../../interfaces/User.type';
import { AuthContextType, AuthProviderType } from '../../../interfaces/AuthContext.type';
import {api, apiFetch} from "../api/routes"

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<AuthProviderType> = ({ children }) => {
    const [user, setUser] = useState<BaseUserType | null>(null);
    const [isInitializing, setIsInitializing] = useState<boolean>(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const response = await apiFetch(api.user.profile);

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
            } finally {
                setIsInitializing(false);
            }
        };

        loadUser();
    }, []);

    const login = (userData: BaseUserType) => {
        setUser(userData);
    };

    const logout = (message: string = "") => {
        setUser(null);
        window.location.assign("/about")
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