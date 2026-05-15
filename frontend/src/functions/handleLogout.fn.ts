import {api, apiFetch} from "../api/routes";

export default async function handleLogout(logout: (message?: string) => void) {
    try {
        await apiFetch(api.auth.logout)
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        logout();
    }
}