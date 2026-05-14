import { BaseUserType } from "./User.type";

export interface AuthContextType {
    user: BaseUserType | null;
    login: (user: BaseUserType) => void;
    logout: (message?: string) => void;
    isAuthenticated: boolean;
    isInitializing: boolean;
}

export interface AuthProviderType {
    children: React.ReactNode;
}