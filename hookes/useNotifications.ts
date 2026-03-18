import { useEffect, useRef } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { tokenStorage } from "../lib/api/api-client";
import {
  NotificationResponse,
  NotificationType,
} from "../lib/api/types";
import { notificationService } from "../lib/api/services/notification.service";
import { useAuthStore } from "../stores";

const DEFAULT_WS_URL = "http://localhost:8081/ws";

function toStompWsUrl(rawUrl: string): string {
  if (rawUrl.startsWith("http://")) return rawUrl.replace("http://", "ws://");
  if (rawUrl.startsWith("https://")) return rawUrl.replace("https://", "wss://");
  return rawUrl;
}

export const notificationKeys = {
  all: ["notifications"] as const,
  unreadList: (page: number, size: number) =>
    [...notificationKeys.all, "unread", { page, size }] as const,
  unreadCount: () => [...notificationKeys.all, "count", "unread"] as const,
};

const silentRealtimeTypes: NotificationType[] = ["POINTS_EARNED"];

export function useUnreadNotifications(page = 0, size = 20, enabled = true) {
  return useQuery({
    queryKey: notificationKeys.unreadList(page, size),
    queryFn: () => notificationService.getUnread(page, size),
    enabled,
    staleTime: 20 * 1000,
  });
}

export function useNotificationUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("All notifications marked as read");
    },
    onError: () => {
      toast.error("Failed to mark all as read");
    },
  });
}

export function useNotificationRealtime(enabled = true) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!enabled || !isAuthenticated) return;

    const token = tokenStorage.getAccess();
    if (!token) return;

    const configuredUrl = process.env.NEXT_PUBLIC_NOTIFICATIONS_WS_URL ?? DEFAULT_WS_URL;
    const wsUrl = toStompWsUrl(configuredUrl);
    const wsUrlWithToken = `${wsUrl}${wsUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`;

    const client = new Client({
      brokerURL: wsUrlWithToken,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      debug: () => undefined,
      onConnect: () => {
        client.subscribe(
          "/user/queue/notifications",
          (frame: IMessage) => {
            try {
              const payload: NotificationResponse = JSON.parse(frame.body);
              queryClient.invalidateQueries({ queryKey: notificationKeys.all });

              if (!silentRealtimeTypes.includes(payload.type)) {
                toast(payload.title || "New notification");
              }
            } catch {
              queryClient.invalidateQueries({ queryKey: notificationKeys.all });
            }
          },
          {
            Authorization: `Bearer ${token}`,
          },
        );
      },
      onStompError: () => {
        // Let auto reconnect handle temporary failures
      },
      onWebSocketError: () => {
        // Let auto reconnect handle temporary failures
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      clientRef.current?.deactivate();
      clientRef.current = null;
    };
  }, [enabled, isAuthenticated, queryClient]);
}
