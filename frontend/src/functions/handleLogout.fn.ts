export default async function handleLogout(logout: (message?: string) => void) {
    try {
        const endpoint_logout = `${process.env.REACT_APP_BACKEND_ORIGIN || window.location.origin}/user/logout`
        await fetch(endpoint_logout, {
            method: 'POST',
            credentials: 'include',
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        logout();
    }
}