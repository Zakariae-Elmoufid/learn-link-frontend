import { useAuthStore } from "../stores";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LoginRequest,
  RegisterRequest,
  UserProfileCreate,
  AuthUser,
} from "../lib/api/types";
import { authService } from "../lib/api/services/auth.service";
import {
  profileService,
  UserProfileUpdate,
} from "../lib/api/services/profile.service";
import { subjectService } from "../lib/api/services/subject.service";
import toast from "react-hot-toast";
import { tokenStorage } from "../lib/api/api-client";
import { useEffect, useState } from "react";

/**
 * Hook to initialize auth state from token on app load
 * Call this in your root layout or providers
 */
export function useInitAuth() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);

  // Only run on client after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const token = tokenStorage.getAccess();
    
    if (!token) {
      console.log("[Auth] No token found");
      setLoading(false);
      return;
    }

    // If user is already set, don't reload
    if (user) {
      console.log("[Auth] User already loaded:", user.id);
      return;
    }

    console.log("[Auth] Token found, parsing user from JWT...");
    
    try {
      // Parse JWT to extract user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log("[Auth] JWT payload:", payload);
      
      const authUser: AuthUser = {
        id: payload.userId,
        email: payload.sub, // subject is usually email/username
        username: payload.sub,
        active: true,
        emailVerified: true,
        role: payload.role || 'STUDENT',
      };
      
      console.log("[Auth] Setting user from token:", authUser);
      setUser(authUser);
    } catch (error) {
      console.error("[Auth] Failed to parse token:", error);
      tokenStorage.clearTokens();
      setLoading(false);
    }
  }, [mounted, setUser, setLoading, user]);
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const auth = await authService.login(data);
      tokenStorage.setTokens(auth);
      return auth;
    },
    onSuccess: (auth) => {
      setUser(auth.user);
      toast.success("Welcome back!");
    },
    onError: () => toast.error("Invalid email or password"),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: () => {
      toast.success(
        "Registration successful! Please check your email to verify your account.",
      );
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(message);
    },
  });
}
export function useVerifyEmail() {
  return useMutation({
    mutationFn: (code: string) => authService.verifyEmail(code),
    onSuccess: (message) => {
      toast.success(message || "Account activated!");
    },
    onError: () => {
      toast.error("Invalid or expired verification code");
    },
  });
}

export function useCreateProfile() {
  return useMutation({
    mutationFn: ({
      data,
      imageFile,
    }: {
      data: UserProfileCreate;
      imageFile?: File;
    }) => profileService.create(data, imageFile),
    onSuccess: () => {
      toast.success("Profile created successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to create profile";
      toast.error(message);
    },
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => profileService.getMe(),
    retry: false,
  });
}

export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: () => subjectService.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      imageFile,
    }: {
      data: UserProfileUpdate;
      imageFile?: File;
    }) => profileService.update(data, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      toast.success("Profile updated successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to update profile";
      toast.error(message);
    },
  });
}

// ─── Messaging Hooks ─────────────────────────────────────────────────────────
export {
  useConversations,
  useMessages,
  useSendMessage,
  useMarkAsRead,
  useMarkConversationAsRead,
  useDeleteMessage,
  useDeleteConversation,
  useUnreadCount,
  useUnreadCountInConversation,
  messageKeys,
} from './useMessaging'

// ─── WebSocket Hook ──────────────────────────────────────────────────────────
export { useWebSocket } from './useWebSocket'
