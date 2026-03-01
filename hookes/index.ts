import {useAuthStore} from "../stores";
import {  useMutation } from '@tanstack/react-query'
import {LoginRequest, RegisterRequest} from "../lib/api/types";
import {authService} from "../lib/api/services/auth.service";
import toast from "react-hot-toast";
import {tokenStorage} from "../lib/api/api-client";


export function useLogin() {
    const setUser = useAuthStore((s) => s.setUser)

    return useMutation({
        mutationFn: async (data: LoginRequest) => {
            const auth = await authService.login(data)
            tokenStorage.setTokens(auth)
            return auth
        },
        onSuccess: (auth) => {
            setUser(auth.user)
            toast.success('Welcome back!')
        },
        onError: () => toast.error('Invalid email or password'),
    })
}

export function useRegister() {
    return useMutation({
        mutationFn: (data: RegisterRequest) => authService.register(data),
        onSuccess: () => {
            toast.success('Registration successful! Please check your email to verify your account.')
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Registration failed. Please try again.'
            toast.error(message)
        },
    })
}
