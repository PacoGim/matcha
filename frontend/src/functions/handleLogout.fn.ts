import { api } from "../api/routes";

export default async function handleLogout(logout: (message?: string) => void) {
    try {
        await api.auth.logout.fetch()
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        logout();
    }
}