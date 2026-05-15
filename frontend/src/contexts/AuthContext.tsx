import React, { createContext, useContext, useState, useEffect } from 'react'

//*********************** Types ********************\\
import type { BaseUserType } from '../../../interfaces/User.type'
import type { AuthContextType, AuthProviderType } from '../../../interfaces/AuthContext.type'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider: React.FC<AuthProviderType> = ({ children }) => {
    const [user, setUser] = useState<BaseUserType | null>(null)
    const [isInitializing, setIsInitializing] = useState<boolean>(true)

    useEffect(() => {
        const loadUser = async () => {
            try {
                // const endpoint_profile = `/api/user/profile`
                const endpoint_profile = `/api/user/profile`
                const response = await fetch(endpoint_profile, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                if (response.ok) {
                    const data = await response.json()
                    setUser(data.user)
                }
            } catch (err) {
                console.error('Auth initialization error:', err)
            } finally {
                setIsInitializing(false)
            }
        }

        loadUser()
    }, [])

    const login = (userData: BaseUserType) => {
        setUser(userData)
    }

    const logout = (message: string = "") => {
        setUser(null)
        window.location.assign("/about")
    }

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isInitializing,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}