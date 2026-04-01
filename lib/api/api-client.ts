import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import {AuthResponse} from "./types";
import Cookies from 'js-cookie'



export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8081/api'


const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export const tokenStorage = {
    getAccess: () => Cookies.get(ACCESS_TOKEN_KEY) ?? null,
    getRefresh: () => Cookies.get(REFRESH_TOKEN_KEY) ?? null,
    setTokens: (auth: AuthResponse) => {
        Cookies.set(ACCESS_TOKEN_KEY, auth.access_token, { expires: 1, sameSite: 'strict' })
        Cookies.set(REFRESH_TOKEN_KEY, auth.refresh_token, { expires: 30, sameSite: 'strict' })
    },
    clearTokens: () => {
        Cookies.remove(ACCESS_TOKEN_KEY)
        Cookies.remove(REFRESH_TOKEN_KEY)
    },
}

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccess()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

let isRefreshing = false
let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void
    }> = []

function processQueue(error: AxiosError | null, token: string | null = null) {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error)
        else resolve(token)
    })
    failedQueue = []
}
apiClient.interceptors.response.use(
    (response ) => response,
    async (error: AxiosError) => {
            const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
        if (error.response?.status === 401 && !original._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({resolve, reject})
                }).then((token) => {
                    original.headers.Authorization = `Bearer ${token}`
                    return apiClient(original)
                })
            }
            original._retry = true
            isRefreshing = true


            const refreshToken = tokenStorage.getRefresh()
            if (!refreshToken) {
                tokenStorage.clearTokens()
                window.location.href = '/auth/login'
                return Promise.reject(error)
            }
            try {
                const {data} = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/refresh`, {
                    refresh_token: refreshToken,
                })
                tokenStorage.setTokens(data)
                processQueue(null, data.access_token)
                original.headers.Authorization = `Bearer ${data.access_token}`
                return apiClient(original)
            } catch (refreshError) {
                processQueue(refreshError as AxiosError, null)
                tokenStorage.clearTokens()
                window.location.href = '/auth/login'
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }
        return Promise.reject(error)

    },
);
