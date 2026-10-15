import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../client";

// Helper to get token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("zayanToken");
  }
  return null;
};

export interface TrackEventPayload {
  eventType: "view" | "click" | "chat_started" | "message_sent" | "message_received";
  itemType: "product" | "property";
  itemId: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  responseTime?: number;
  conversationId?: string;
}

export interface AnalyticsOverviewResponse {
  message: string;
  metrics: {
    views: number;
    clicks: number;
    chatsStarted: number;
    messagesSent: number;
    messagesReceived: number;
    conversionRate: number;
    avgResponseTimeMinutes: number | null;
  };
}

export interface TimeSeriesDataPoint {
  date: string;
  views: number;
  clicks: number;
  chatsStarted: number;
  messagesSent: number;
  messagesReceived: number;
}

export interface TimeSeriesResponse {
  message: string;
  data: TimeSeriesDataPoint[];
  groupBy: string;
}

export interface TopItem {
  itemId: string;
  itemType: "product" | "property";
  count: number;
  name: string;
  image: string | null;
  price: number | null;
  rating: number | null;
}

export interface TopItemsResponse {
  message: string;
  items: TopItem[];
}

export interface ResponseTimeTrendDataPoint {
  date: string;
  avgResponseTimeMinutes: number;
  minResponseTimeMinutes: number;
  maxResponseTimeMinutes: number;
  count: number;
}

export interface ResponseTimeTrendsResponse {
  message: string;
  data: ResponseTimeTrendDataPoint[];
  groupBy: string;
}

export interface AnalyticsQueryParams {
  startDate?: string;
  endDate?: string;
  itemType?: "product" | "property";
  itemId?: string;
  eventType?: string;
  groupBy?: "hour" | "day" | "week" | "month";
  limit?: number;
  metric?: "views" | "clicks" | "chatsStarted";
}

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
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
  tagTypes: ["Analytics"],
  endpoints: (builder) => ({
    trackEvent: builder.mutation<{ message: string; eventId: string }, TrackEventPayload>({
      query: (payload) => ({
        url: "api/analytics/events/track",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Analytics"],
    }),
    getAnalyticsOverview: builder.query<AnalyticsOverviewResponse, AnalyticsQueryParams>({
      query: (params) => ({
        url: "api/analytics/overview",
        params,
      }),
      providesTags: ["Analytics"],
    }),
    getTimeSeriesData: builder.query<TimeSeriesResponse, AnalyticsQueryParams>({
      query: (params) => ({
        url: "api/analytics/time-series",
        params,
      }),
      providesTags: ["Analytics"],
    }),
    getTopItems: builder.query<TopItemsResponse, AnalyticsQueryParams>({
      query: (params) => ({
        url: "api/analytics/top-items",
        params,
      }),
      providesTags: ["Analytics"],
    }),
    getResponseTimeTrends: builder.query<ResponseTimeTrendsResponse, AnalyticsQueryParams>({
      query: (params) => ({
        url: "api/analytics/response-time-trends",
        params,
      }),
      providesTags: ["Analytics"],
    }),
  }),
});

export const {
  useTrackEventMutation,
  useGetAnalyticsOverviewQuery,
  useGetTimeSeriesDataQuery,
  useGetTopItemsQuery,
  useGetResponseTimeTrendsQuery,
} = analyticsApi;

