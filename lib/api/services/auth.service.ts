import {AuthResponse, LoginRequest, RefreshTokenRequest, RegisterRequest} from "../types";
import {apiClient} from "../api-client";

export const authService = {
    register: (data: RegisterRequest) =>
        apiClient.post<string>('/auth/register', data).then((r) => r.data),

    verifyEmail: (code: string) =>
        apiClient.get<string>('/auth/verify', { params: { code } }).then((r) => r.data),

    login: (data: LoginRequest) =>
        apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

    refresh: (data: RefreshTokenRequest) =>
        apiClient.post<AuthResponse>('/auth/refresh', data).then((r) => r.data),
}