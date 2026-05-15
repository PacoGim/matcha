
interface LoginReqType {
    email: string
    password: string
}

interface apiRoute {
    path: string
    method: 'post' | 'get' | 'put',
    fn : Function
}

interface apiRouter {
    auth: { login: apiRoute, register: apiRoute, logout: apiRoute, checkMail: apiRoute };
    user: { profile: apiRoute, updateProfile: apiRoute, changePassword: apiRoute, forgotPassword: apiRoute, resetPassword: apiRoute };
    app: { search: apiRoute, suggestion: apiRoute, profile: apiRoute };
}

const host = process.env.REACT_APP_BACKEND_ORIGIN || ""

const api: apiRouter = {
    auth: {
        login: { path: '/auth/login', method: 'post', fn:fetchLogin },
        register: { path: '/auth/register', method: 'post', fn:fetchLogin },
        logout: { path: '/auth/logout', method: 'get', fn:fetchLogin },
        checkMail: { path: '/auth/check-mail', method: 'post', fn:fetchLogin }
    },
    user: {
        profile: { path: '/user/profile', method: 'get', fn:fetchLogin },
        updateProfile: { path: '/user/profile', method: 'put' , fn:fetchLogin},
        changePassword: { path: '/user/change-password', method: 'put', fn:fetchLogin },
        forgotPassword: { path: '/user/forgot-password', method: 'post' , fn:fetchLogin},
        resetPassword: { path: '/user/reset-password', method: 'post' , fn:fetchLogin}
    },
    app: {
        search: { path: '/app/search', method: 'get' , fn:fetchLogin},
        suggestion: { path: '/app/suggestion', method: 'get', fn:fetchLogin },
        profile: { path: '/app/profile/:id', method: 'get', fn:fetchLogin }
    }
}

function fetchLogin(body: LoginReqType) {
    return apiFetch(api.auth.login,null, body)
}

function apiFetch(route: apiRoute, options?: any, body?: LoginReqType) {
    return fetch(host + route.path, {
        ...options,
        method: route.method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
}

export { api, apiFetch }