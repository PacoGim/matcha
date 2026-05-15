interface ApiRoute {
    path: string
    method: 'post' | 'get' | 'put',
    fetch: Function
}

interface ApiRouter {
    auth: { login: ApiRoute, register: ApiRoute, logout: ApiRoute, checkMail: ApiRoute }
    user: { profile: ApiRoute, updateProfile: ApiRoute, changePassword: ApiRoute, forgotPassword: ApiRoute, resetPassword: ApiRoute }
    app: { search: ApiRoute, suggestion: ApiRoute, profile: ApiRoute }
}

// const host = process.env.REACT_APP_BACKEND_ORIGIN || ""
const host = "/api"

const api: ApiRouter = {
    auth: {
        login: { path: '/auth/login', method: 'post', fetch: fetchLogin },
        register: { path: '/auth/register', method: 'post', fetch: fetchRegister },
        logout: { path: '/auth/logout', method: 'get', fetch: fetchLogout },
        checkMail: { path: '/auth/check-mail', method: 'post', fetch: fetchCheckMail }
    },
    user: {
        profile: { path: '/user/profile', method: 'get', fetch: fetchGetProfile },
        updateProfile: { path: '/user/profile', method: 'put', fetch: fetchUpdateProfile },
        changePassword: { path: '/user/change-password', method: 'put', fetch: fetchChangePassword },
        forgotPassword: { path: '/user/forgot-password', method: 'post', fetch: fetchForgotPassword },
        resetPassword: { path: '/user/reset-password', method: 'post', fetch: fetchResetPassword }
    },
    app: {
        search: { path: '/app/search', method: 'get', fetch: fetchSearchProfiles },
        suggestion: { path: '/app/suggestion', method: 'get', fetch: fetchSuggestionProfiles },
        profile: { path: '/app/profile/:id', method: 'get', fetch: fetchProfileById }
    }
}

interface LoginReqType {
    email: string
    password: string
}

function fetchLogin(body: LoginReqType) {
    return apiFetch(api.auth.login, null, body)
}

function fetchLogout() {
    return apiFetch(api.auth.logout)
}

interface RegisterReqType {
    email: string
    username: string
    password: string
    first_name: string
    last_name: string
    birthdate: string
}

function fetchRegister(body: RegisterReqType) {
    return apiFetch(api.auth.register, null, body)
}

interface CheckMailType {
    token: string
}

function fetchCheckMail(body: CheckMailType) {
    return apiFetch(api.auth.checkMail, null, body)
}

interface ChangePasswordType {
    new_password: string
}

function fetchChangePassword(body: ChangePasswordType) {
    return apiFetch(api.user.changePassword, null, body)
}

interface ForgotPasswordType {
    email: string
}

function fetchForgotPassword(body: ForgotPasswordType) {
    return apiFetch(api.user.forgotPassword, null, body)
}

interface ResetPasswordType {
    token: string
    new_password: string
}

function fetchResetPassword(body: ResetPasswordType) {
    return apiFetch(api.user.resetPassword, null, body)
}

function fetchGetProfile() {
    return apiFetch(api.user.profile)
}

interface ProfilePutType {
    user: {
        email: string
        first_name: string
        last_name: string
    }
    profile: {
        gender: any
        sexual_preference: any
        latitude: any
        longitude: any
        allow_gps: boolean
        biography: string
    }
}

function fetchUpdateProfile(body: ProfilePutType) {
    return apiFetch(api.user.updateProfile, null, body)
}

interface SearchProfileType {
    max_distance: number
    min_age: number
    max_age: number
    min_fame: number
    sort_by: "distance" | "fame" | "age"
    interests: string[]
}

function fetchSearchProfiles(searchParams: URLSearchParams) {
    return fetch(`${host}${api.app.search.path}?${searchParams.toString()}`, {
        method:api.app.search.method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    })
}

function fetchSuggestionProfiles(count:number){
        return fetch(`${host}${api.app.suggestion.path}?count=${count.toString()}`, {
        method:api.app.search.method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    })
}

function fetchProfileById(id:string){
        return fetch(`${host}${api.app.profile.path}/${id}`, {
        method:api.app.search.method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    })
}

function apiFetch(route: ApiRoute, options?: any, body?: ProfilePutType | LoginReqType | CheckMailType | ChangePasswordType | ForgotPasswordType) {
    console.warn(route.path, options, body)
    return fetch(host + route.path, {
        ...options,
        method: route.method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
}

export { api, apiFetch }