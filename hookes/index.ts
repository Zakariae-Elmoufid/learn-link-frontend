import { useAuthStore } from "../stores";
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
  LoginRequest,
  RegisterRequest,
  UserProfileCreate,
  AuthUser,
  ConnectionRequest,
  CreateGroupRequest,
  UpdateGroupRequest,
  GroupRole,
} from "../lib/api/types";
import { authService } from "../lib/api/services/auth.service";
import {
  profileService,
  UserProfileUpdate,
} from "../lib/api/services/profile.service";
import { subjectService } from "../lib/api/services/subject.service";
import { matchingService } from "../lib/api/services/matching.service";
import { connectionsService } from "../lib/api/services/connections.service";
import { groupsService } from "../lib/api/services/groups.service";
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

// ─── Matching Hooks ──────────────────────────────────────────────────────────

export const matchingKeys = {
  all: ['matching'] as const,
  suggestions: (limit?: number) => [...matchingKeys.all, 'suggestions', { limit }] as const,
  suggestionsBySubject: (subjectId: number, limit?: number) => 
    [...matchingKeys.all, 'suggestions', 'subject', subjectId, { limit }] as const,
  compatibility: (userId: number) => [...matchingKeys.all, 'compatibility', userId] as const,
}

export function useMatchSuggestions(limit = 10) {
  return useQuery({
    queryKey: matchingKeys.suggestions(limit),
    queryFn: () => matchingService.getSuggestions(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useMatchSuggestionsBySubject(subjectId: number | null, limit = 10) {
  return useQuery({
    queryKey: matchingKeys.suggestionsBySubject(subjectId!, limit),
    queryFn: () => matchingService.getSuggestionsBySubject(subjectId!, limit),
    enabled: !!subjectId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCompatibility(userId: number) {
  return useQuery({
    queryKey: matchingKeys.compatibility(userId),
    queryFn: () => matchingService.getCompatibility(userId),
    enabled: !!userId,
  })
}

// ─── Connections Hooks ───────────────────────────────────────────────────────

export const connectionKeys = {
  all: ['connections'] as const,
  list: () => [...connectionKeys.all, 'list'] as const,
  count: () => [...connectionKeys.all, 'count'] as const,
  detail: (id: number) => [...connectionKeys.all, id] as const,
  check: (userId: number) => [...connectionKeys.all, 'check', userId] as const,
  requests: {
    all: ['connection-requests'] as const,
    pending: () => [...connectionKeys.requests.all, 'pending'] as const,
    pendingCount: () => [...connectionKeys.requests.all, 'pending', 'count'] as const,
    sent: () => [...connectionKeys.requests.all, 'sent'] as const,
  },
}

export function useConnections() {
  return useQuery({
    queryKey: connectionKeys.list(),
    queryFn: () => connectionsService.getConnections(),
  })
}

export function useConnectionsCount() {
  return useQuery({
    queryKey: connectionKeys.count(),
    queryFn: () => connectionsService.getConnectionsCount(),
  })
}

export function useConnection(connectionId: number) {
  return useQuery({
    queryKey: connectionKeys.detail(connectionId),
    queryFn: () => connectionsService.getConnection(connectionId),
    enabled: !!connectionId,
  })
}

export function useCheckConnection(otherUserId: number) {
  return useQuery({
    queryKey: connectionKeys.check(otherUserId),
    queryFn: () => connectionsService.checkConnection(otherUserId),
    enabled: !!otherUserId,
  })
}

export function usePendingRequests() {
  return useQuery({
    queryKey: connectionKeys.requests.pending(),
    queryFn: () => connectionsService.getPendingRequests(),
  })
}

export function usePendingRequestsCount() {
  return useQuery({
    queryKey: connectionKeys.requests.pendingCount(),
    queryFn: () => connectionsService.getPendingRequestsCount(),
  })
}

export function useSentRequests() {
  return useQuery({
    queryKey: connectionKeys.requests.sent(),
    queryFn: () => connectionsService.getSentRequests(),
  })
}

export function useSendConnectionRequest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: ConnectionRequest) => connectionsService.sendRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchingKeys.all })
      queryClient.invalidateQueries({ queryKey: connectionKeys.requests.sent() })
      toast.success('Connection request sent!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to send request'
      toast.error(message)
    },
  })
}

export function useAcceptConnectionRequest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (requestId: number) => connectionsService.acceptRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.all })
      queryClient.invalidateQueries({ queryKey: connectionKeys.requests.all })
      toast.success('Connection accepted!')
    },
    onError: () => toast.error('Failed to accept request'),
  })
}

export function useRejectConnectionRequest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (requestId: number) => connectionsService.rejectRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.requests.pending() })
      queryClient.invalidateQueries({ queryKey: connectionKeys.requests.pendingCount() })
      toast.success('Request rejected')
    },
    onError: () => toast.error('Failed to reject request'),
  })
}

export function useCancelConnectionRequest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (requestId: number) => connectionsService.cancelRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchingKeys.all })
      queryClient.invalidateQueries({ queryKey: connectionKeys.requests.sent() })
      toast.success('Request cancelled')
    },
    onError: () => toast.error('Failed to cancel request'),
  })
}

export function useRemoveConnection() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (connectionId: number) => connectionsService.removeConnection(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.all })
      toast.success('Connection removed')
    },
    onError: () => toast.error('Failed to remove connection'),
  })
}

// ─── Study Groups Hooks ──────────────────────────────────────────────────────

export const groupKeys = {
  all: ['groups'] as const,
  discover: (page?: number, size?: number) => [...groupKeys.all, 'discover', { page, size }] as const,
  search: (keyword: string, page?: number) => [...groupKeys.all, 'search', keyword, { page }] as const,
  bySubject: (subjectId: number) => [...groupKeys.all, 'subject', subjectId] as const,
  my: () => [...groupKeys.all, 'my'] as const,
  owned: () => [...groupKeys.all, 'owned'] as const,
  detail: (id: number) => [...groupKeys.all, id] as const,
  full: (id: number) => [...groupKeys.all, id, 'full'] as const,
  members: (id: number) => [...groupKeys.all, id, 'members'] as const,
  requests: (id: number) => [...groupKeys.all, id, 'requests'] as const,
}

export function useDiscoverGroups(page = 0, size = 10) {
  return useQuery({
    queryKey: groupKeys.discover(page, size),
    queryFn: () => groupsService.discover(page, size),
  })
}

export function useSearchGroups(keyword: string, page = 0, size = 10) {
  return useQuery({
    queryKey: groupKeys.search(keyword, page),
    queryFn: () => groupsService.search(keyword, page, size),
    enabled: keyword.length > 0,
  })
}

export function useGroupsBySubject(subjectId: number | null) {
  return useQuery({
    queryKey: groupKeys.bySubject(subjectId!),
    queryFn: () => groupsService.getBySubject(subjectId!),
    enabled: !!subjectId,
  })
}

export function useMyGroups() {
  return useQuery({
    queryKey: groupKeys.my(),
    queryFn: () => groupsService.getMyGroups(),
  })
}

export function useOwnedGroups() {
  return useQuery({
    queryKey: groupKeys.owned(),
    queryFn: () => groupsService.getOwnedGroups(),
  })
}

export function useGroup(groupId: number | null) {
  return useQuery({
    queryKey: groupKeys.detail(groupId!),
    queryFn: () => groupsService.getById(groupId!),
    enabled: !!groupId,
  })
}

export function useGroupWithMembers(groupId: number | null) {
  return useQuery({
    queryKey: groupKeys.full(groupId!),
    queryFn: () => groupsService.getWithMembers(groupId!),
    enabled: !!groupId,
  })
}

export function useGroupMembers(groupId: number | null) {
  return useQuery({
    queryKey: groupKeys.members(groupId!),
    queryFn: () => groupsService.getMembers(groupId!),
    enabled: !!groupId,
  })
}

export function useGroupPendingRequests(groupId: number | null) {
  return useQuery({
    queryKey: groupKeys.requests(groupId!),
    queryFn: () => groupsService.getPendingRequests(groupId!),
    enabled: !!groupId,
  })
}

export function useCreateGroup() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateGroupRequest) => groupsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.my() })
      queryClient.invalidateQueries({ queryKey: groupKeys.owned() })
      toast.success('Group created successfully!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create group'
      toast.error(message)
    },
  })
}

export function useUpdateGroup() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: number; data: UpdateGroupRequest }) => 
      groupsService.update(groupId, data),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.full(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.my() })
      toast.success('Group updated!')
    },
    onError: () => toast.error('Failed to update group'),
  })
}

export function useDeleteGroup() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (groupId: number) => groupsService.delete(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all })
      toast.success('Group deleted')
    },
    onError: () => toast.error('Failed to delete group'),
  })
}

export function useJoinGroup() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (groupId: number) => groupsService.join(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all })
      toast.success('Joined group!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to join group'
      toast.error(message)
    },
  })
}

export function useRequestJoinGroup() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (groupId: number) => groupsService.requestJoin(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all })
      toast.success('Join request sent!')
    },
    onError: () => toast.error('Failed to send join request'),
  })
}

export function useLeaveGroup() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (groupId: number) => groupsService.leave(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all })
      toast.success('Left group')
    },
    onError: () => toast.error('Failed to leave group'),
  })
}

export function useApproveGroupRequest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ groupId, requesterId }: { groupId: number; requesterId: number }) =>
      groupsService.approveRequest(groupId, requesterId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.requests(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.full(groupId) })
      toast.success('Request approved!')
    },
    onError: () => toast.error('Failed to approve request'),
  })
}

export function useRejectGroupRequest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ groupId, requesterId }: { groupId: number; requesterId: number }) =>
      groupsService.rejectRequest(groupId, requesterId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.requests(groupId) })
      toast.success('Request rejected')
    },
    onError: () => toast.error('Failed to reject request'),
  })
}

export function useRemoveGroupMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: number; memberId: number }) =>
      groupsService.removeMember(groupId, memberId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.full(groupId) })
      toast.success('Member removed')
    },
    onError: () => toast.error('Failed to remove member'),
  })
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ groupId, memberId, role }: { groupId: number; memberId: number; role: GroupRole }) =>
      groupsService.updateMemberRole(groupId, memberId, role),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.full(groupId) })
      toast.success('Role updated!')
    },
    onError: () => toast.error('Failed to update role'),
  })
}
