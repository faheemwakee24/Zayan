import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../client";

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  averageResponseMinutes?: number | null;
  lastSeen?: string | null;
}

export interface ChatProperty {
  id: string;
  title: string;
  images?: string[];
  price?: number;
  location?: string;
}

export interface ChatProduct {
  id: string;
  title: string;
  images?: string[];
  price?: number;
  currency?: string;
  unit?: string;
  store?: {
    name: string;
    location: string;
  } | null;
}

export interface Conversation {
  id: string;
  buyer: ChatUser | null;
  seller: ChatUser | null;
  property: ChatProperty | null;
  product: ChatProduct | null;
  // Unified Context Fields
  contextType?: "product" | "property" | "support";
  contextId?: string;
  // Metadata for UI routing
  myRole?: "buyer" | "seller" | "unknown";
  lastMessage: string;
  lastMessageSenderId: string | null;
  updatedAt: string;
  createdAt: string;
  isSupportChat?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  message: string;
  type: "text" | "image" | "file" | "system";
  createdAt: string;
  updatedAt: string;
  mediaUrl?: string;
  fileName?: string;
  mimeType?: string;
}

export interface StartConversationPayload {
  buyerId: string;
  sellerId: string;
  propertyId?: string;
  productId?: string;
}

export interface StartConversationResponse {
  conversation: Conversation;
  messages: Message[];
}

export interface GetConversationsResponse {
  conversations: Conversation[];
}

export interface GetMessagesResponse {
  messages: Message[];
}

export interface SendMessagePayload {
  conversationId: string;
  message: string;
  type?: "text" | "image" | "file" | "system";
  mediaUrl?: string;
  fileName?: string;
  mimeType?: string;
}

export interface SendMessageResponse {
  message: Message;
}

export interface UpdateLastSeenPayload {
  conversationId: string;
}

export interface UpdateLastSeenResponse {
  success: boolean;
  lastSeen: string;
}

export interface GetSupportConversationResponse {
  conversation: {
    id: string;
    buyerId: string;
    adminId: string;
    isSupportChat: boolean;
    lastMessage: string;
    createdAt: string;
    updatedAt: string;
  };
  messages: Message[];
}

export interface SendSupportMessagePayload {
  conversationId: string;
  message?: string;
  mediaUrl?: string;
  fileName?: string;
  mimeType?: string;
  type?: string;
}

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("zayanToken");
  }
  return null;
};

export const chatApi = createApi({
  reducerPath: "chatApi",
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
  tagTypes: ["Conversation", "Message"],
  endpoints: (builder) => ({
    startConversation: builder.mutation<StartConversationResponse, StartConversationPayload>({
      query: (body) => ({
        url: "api/chat/start",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Conversation", id: "LIST" }],
    }),
    getUserConversations: builder.query<
      GetConversationsResponse,
      { role?: "realestate_buyer" | "realestate_seller" | "ecommerce_buyer" | "ecommerce_seller" } | void
    >({
      query: (params) => {
        const role = params?.role;
        const url = role
          ? `api/chat/conversations?role=${role}`
          : "api/chat/conversations";
        return url;
      },
      providesTags: (result) =>
        result?.conversations
          ? [
              ...result.conversations.map((conversation) => ({
                type: "Conversation" as const,
                id: conversation.id,
              })),
              { type: "Conversation" as const, id: "LIST" },
            ]
          : [{ type: "Conversation" as const, id: "LIST" }],
    }),
    getConversationMessages: builder.query<GetMessagesResponse, string>({
      query: (conversationId) => `api/chat/${conversationId}/messages`,
      providesTags: (result, error, conversationId) => [
        { type: "Message", id: conversationId },
      ],
    }),
    sendMessage: builder.mutation<SendMessageResponse, SendMessagePayload>({
      query: (body) => ({
        url: "api/chat/message",
        method: "POST",
        body,
      }),
      // 🚫 Do NOT invalidate anything
      invalidatesTags: [],
    }),
    updateLastSeen: builder.mutation<UpdateLastSeenResponse, UpdateLastSeenPayload>({
      query: (body) => ({
        url: "api/chat/last-seen",
        method: "POST",
        body,
      }),
      invalidatesTags: [],
    }),
    // Support Chat
    getSupportConversation: builder.query<GetSupportConversationResponse, void>({
      query: () => "api/support/conversation",
      providesTags: [{ type: "Conversation", id: "SUPPORT" }],
    }),
    sendSupportMessage: builder.mutation<SendMessageResponse, SendSupportMessagePayload>({
      query: (body) => ({
        url: "api/support/message",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Message", id: "SUPPORT" }],
    }),
    // Report Conversation
    reportConversation: builder.mutation<
      { success: boolean; message: string; report: unknown },
      { conversationId: string; messageId?: string; reason: string; description?: string }
    >({
      query: (body) => ({
        url: "api/reports",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useStartConversationMutation,
  useGetUserConversationsQuery,
  useGetConversationMessagesQuery,
  useSendMessageMutation,
  useUpdateLastSeenMutation,
  useGetSupportConversationQuery,
  useSendSupportMessageMutation,
  useReportConversationMutation,
} = chatApi;


