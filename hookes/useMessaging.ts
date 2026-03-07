import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { messageService } from "../lib/api/services/message.service";
import { SendMessageRequest, MessageResponse } from "../lib/api/types";
import { useMessageStore } from "../stores";
import toast from "react-hot-toast";
import { useEffect } from "react";

// Query keys
export const messageKeys = {
  all: ["messages"] as const,
  conversations: () => [...messageKeys.all, "conversations"] as const,
  conversation: (userId: number) =>
    [...messageKeys.all, "conversation", userId] as const,
  unreadCount: () => [...messageKeys.all, "unread"] as const,
  unreadCountConversation: (userId: number) =>
    [...messageKeys.all, "unread", userId] as const,
};

/**
 * Hook to fetch all conversations
 */
export function useConversations() {
  const setConversations = useMessageStore((s) => s.setConversations);

  return useQuery({
    queryKey: messageKeys.conversations(),
    queryFn: async () => {
      const data = await messageService.getConversations();
      setConversations(data);
      return data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch messages for a specific conversation with infinite scroll
 */
export function useMessages(otherUserId: number | null) {
  const setMessages = useMessageStore((s) => s.setMessages);
  const prependMessages = useMessageStore((s) => s.prependMessages);

  // Clear messages when conversation changes
  useEffect(() => {
    setMessages([]);
  }, [otherUserId, setMessages]);

  const query = useInfiniteQuery({
    queryKey: messageKeys.conversation(otherUserId ?? 0),
    queryFn: async ({ pageParam = 0 }) => {
      if (!otherUserId) throw new Error("No user selected");
      return messageService.getConversation(otherUserId, pageParam, 20);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.page + 1;
    },
    initialPageParam: 0,
    enabled: !!otherUserId,
    staleTime: 30 * 1000,
  });

  // Sync messages to store when data changes
  useEffect(() => {
    if (query.data) {
      const allMessages = query.data.pages
        .flatMap((page) => page.content)
        .reverse(); // Reverse to get oldest first for display
      setMessages(allMessages);
    }
  }, [query.data, setMessages]);

  return query;
}

/**
 * Hook to send a message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const addMessage = useMessageStore((s) => s.addMessage);
  const updateConversation = useMessageStore((s) => s.updateConversation);

  return useMutation({
    mutationFn: (data: SendMessageRequest) => messageService.sendMessage(data),
    onSuccess: (message) => {
      // Add message to store
      addMessage(message);

      // Update conversation preview
      updateConversation(message.recipientId, {
        lastMessage: message.content,
        lastMessageAt: message.createdAt,
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
      queryClient.invalidateQueries({
        queryKey: messageKeys.conversation(message.recipientId),
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to send message";
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to mark messages as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: number) => messageService.markAsRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.unreadCount() });
    },
  });
}

/**
 * Hook to mark an entire conversation as read
 */
export function useMarkConversationAsRead() {
  const queryClient = useQueryClient();
  const updateConversation = useMessageStore((s) => s.updateConversation);

  return useMutation({
    mutationFn: (senderId: number) =>
      messageService.markConversationAsRead(senderId),
    onSuccess: (_, senderId) => {
      updateConversation(senderId, { unreadCount: 0 });
      queryClient.invalidateQueries({ queryKey: messageKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
    },
  });
}

/**
 * Hook to delete a message
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: number) => messageService.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.all });
      toast.success("Message deleted");
    },
    onError: () => {
      toast.error("Failed to delete message");
    },
  });
}

/**
 * Hook to delete a conversation
 */
export function useDeleteConversation() {
  const queryClient = useQueryClient();
  const setActiveConversation = useMessageStore((s) => s.setActiveConversation);

  return useMutation({
    mutationFn: (otherUserId: number) =>
      messageService.deleteConversation(otherUserId),
    onSuccess: () => {
      setActiveConversation(null);
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
      toast.success("Conversation deleted");
    },
    onError: () => {
      toast.error("Failed to delete conversation");
    },
  });
}

/**
 * Hook to get total unread count
 */
export function useUnreadCount() {
  const setTotalUnreadCount = useMessageStore((s) => s.setTotalUnreadCount);

  return useQuery({
    queryKey: messageKeys.unreadCount(),
    queryFn: async () => {
      const count = await messageService.getUnreadCount();
      setTotalUnreadCount(count);
      return count;
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

/**
 * Hook to get unread count for a specific conversation
 */
export function useUnreadCountInConversation(senderId: number | null) {
  return useQuery({
    queryKey: messageKeys.unreadCountConversation(senderId ?? 0),
    queryFn: () => messageService.getUnreadCountInConversation(senderId!),
    enabled: !!senderId,
    staleTime: 30 * 1000,
  });
}
