import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../client";

// Helper to get token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("zayanToken");
  }
  return null;
};

export type NotificationChannel = "ecommerce" | "real-estate";

export interface Notification {
  _id: string;
  userId: string;
  type:
    | "new_message"
    | "new_review"
    | "listing_inquiry"
    | "order_placed"
    | "verification_approved"
    | "verification_rejected";
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  actionUrl: string | null;
  metadata: Record<string, any>;
  relatedId: string | null;
  relatedType: "conversation" | "review" | "product" | "property" | "order" | "verification" | null;
  channel?: NotificationChannel | null;
  emailSent: boolean;
  emailSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  message: string;
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

export interface UnreadCountResponse {
  message: string;
  unreadCount: number;
}

export interface NotificationQueryParams {
  limit?: number;
  skip?: number;
  read?: boolean;
  /** Filter by app context so ecommerce users don't see real-estate notifications and vice versa */
  channel?: NotificationChannel;
}

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, NotificationQueryParams>({
      query: (params) => ({
        url: "api/notifications",
        params: params ? { ...params, channel: params.channel } : undefined,
      }),
      providesTags: (result, error, arg) =>
        arg?.channel
          ? ["Notifications", { type: "Notifications" as const, id: arg.channel }]
          : ["Notifications"],
    }),
    getUnreadCount: builder.query<
      UnreadCountResponse,
      NotificationChannel | void
    >({
      query: (channel) => ({
        url: "api/notifications/unread-count",
        params: channel ? { channel } : undefined,
      }),
      providesTags: (result, error, channel) =>
        channel
          ? ["Notifications", { type: "Notifications" as const, id: `count-${channel}` }]
          : ["Notifications"],
    }),
    markAsRead: builder.mutation<{ message: string; notification: Notification }, string>({
      query: (notificationId) => ({
        url: `api/notifications/${notificationId}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),
    markAllAsRead: builder.mutation<
      { message: string; updatedCount: number },
      void
    >({
      query: () => ({
        url: "api/notifications/read-all",
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),
    deleteNotification: builder.mutation<{ message: string }, string>({
      query: (notificationId) => ({
        url: `api/notifications/${notificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;

