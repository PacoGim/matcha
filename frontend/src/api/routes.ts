
interface apiRoute {
    path: string;
    method: 'post' | 'get' | 'put';
}

interface apiRouter {
    auth: { login: apiRoute, register: apiRoute, logout: apiRoute, checkMail: apiRoute };
    user: { profile: apiRoute, updateProfile: apiRoute, changePassword: apiRoute, forgotPassword: apiRoute, resetPassword: apiRoute };
    app: { search: apiRoute, suggestion: apiRoute, profile: apiRoute };
}

const host = process.env.REACT_APP_BACKEND_ORIGIN || ""

const api: apiRouter = {
    auth: {
        login: { path: '/auth/login', method: 'post' },
        register: { path: '/auth/register', method: 'post' },
        logout: { path: '/auth/logout', method: 'get' },
        checkMail: { path: '/auth/check-mail', method: 'post' }
    },
    user: {
        profile: { path: '/user/profile', method: 'get' },
        updateProfile: { path: '/user/profile', method: 'put' },
        changePassword: { path: '/user/change-password', method: 'put' },
        forgotPassword: { path: '/user/forgot-password', method: 'post' },
        resetPassword: { path: '/user/reset-password', method: 'post' }
    },
    app: {
        search: { path: '/app/search', method: 'get' },
        suggestion: { path: '/app/suggestion', method: 'get' },
        profile: { path: '/app/profile/:id', method: 'get' }
    }
}

function apiFetch(route:apiRoute, options?:any){
    return fetch(host + route.path, {
        ...options,
        method:route.method,
        credentials: 'include',
        headers : {'Content-Type': 'application/json'}
    })
}

export {api, apiFetch}