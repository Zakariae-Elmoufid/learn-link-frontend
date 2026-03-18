import { apiClient } from "../api-client";
import {
  NotificationCountResponse,
  NotificationPageResponse,
  NotificationResponse,
  NotificationType,
} from "../types";

export const notificationService = {
  getUnread: (page = 0, size = 20) =>
    apiClient
      .get<NotificationPageResponse>("/notifications/unread", {
        params: { page, size },
      })
      .then((r) => r.data),

  getAll: (page = 0, size = 20) =>
    apiClient
      .get<NotificationPageResponse>("/notifications", {
        params: { page, size },
      })
      .then((r) => r.data),

  getUnreadCount: () =>
    apiClient
      .get<NotificationCountResponse>("/notifications/count")
      .then((r) => r.data),

  markAsRead: (id: number) =>
    apiClient.patch<void>(`/notifications/${id}/read`).then((r) => r.data),

  markAllAsRead: () =>
    apiClient.patch<void>("/notifications/read-all").then((r) => r.data),

  fireTestNotification: (type: NotificationType) =>
    apiClient
      .post<void>(`/test/notifications/fire`, null, {
        params: { type },
      })
      .then((r) => r.data),
};
