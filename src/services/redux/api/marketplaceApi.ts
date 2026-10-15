import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../client";

// Helper to get token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("zayanToken");
  }
  return null;
};

export interface BehaviorTrackPayload {
  itemType: "product" | "property";
  itemId: string;
  action: "view" | "click" | "like" | "share" | "save" | "message" | "search";
  metadata?: Record<string, any>;
  searchQuery?: string;
  searchFilters?: Record<string, any>;
  sessionId?: string;
}

export interface RecentlyViewedItem {
  itemType: "product" | "property";
  itemId: string;
  lastViewedAt: string;
  viewCount: number;
}

export interface SavedSearch {
  _id: string;
  userId: string;
  itemType: "product" | "property";
  name: string;
  searchQuery: string;
  filters: Record<string, any>;
  alertsEnabled: boolean;
  alertFrequency: "daily" | "weekly" | "real-time";
  lastAlertSent: string | null;
  lastNewItemsCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedSearchPayload {
  itemType: "product" | "property";
  name: string;
  searchQuery?: string;
  filters?: Record<string, any>;
  alertsEnabled?: boolean;
  alertFrequency?: "daily" | "weekly" | "real-time";
}

export const marketplaceApi = createApi({
  reducerPath: "marketplaceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { endpoint }) => {
      // Only add auth token for protected endpoints
      if (endpoint !== "getTrending" && endpoint !== "getSimilar") {
        const token = getAuthToken();
        if (token) {
          headers.set("authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ["Trending", "Recommendations", "RecentlyViewed", "SavedSearches"],
  endpoints: (builder) => ({
    // Behavior tracking
    trackBehavior: builder.mutation<
      { message: string; behavior: any },
      BehaviorTrackPayload
    >({
      query: (payload) => ({
        url: "api/behavior/track",
        method: "POST",
        body: payload,
      }),
    }),

    // Get recently viewed items
    getRecentlyViewed: builder.query<
      { message: string; items: RecentlyViewedItem[] },
      { itemType?: "product" | "property"; limit?: number }
    >({
      query: (params) => ({
        url: "api/behavior/recently-viewed",
        params,
      }),
      providesTags: ["RecentlyViewed"],
    }),

    // Get behavior insights
    getBehaviorInsights: builder.query<
      {
        message: string;
        insights: any;
        period: string;
      },
      { days?: number }
    >({
      query: (params) => ({
        url: "api/behavior/insights",
        params,
      }),
    }),

    // Get trending items
    getTrending: builder.query<
      {
        message: string;
        items: any[];
        itemType: string;
      },
      { itemType: "product" | "property"; limit?: number; days?: number }
    >({
      query: (params) => ({
        url: "api/recommendations/trending",
        params,
      }),
      providesTags: ["Trending"],
    }),

    // Get personalized recommendations
    getRecommendations: builder.query<
      {
        message: string;
        items: any[];
        itemType: string;
      },
      { itemType: "product" | "property"; limit?: number }
    >({
      query: (params) => ({
        url: "api/recommendations/recommendations",
        params,
      }),
      providesTags: ["Recommendations"],
    }),

    // Get similar items
    getSimilar: builder.query<
      {
        message: string;
        items: any[];
        itemType: string;
      },
      { itemId: string; itemType: "product" | "property"; limit?: number }
    >({
      query: (params) => ({
        url: "api/recommendations/similar",
        params,
      }),
    }),

    // Saved searches
    saveSearch: builder.mutation<
      { message: string; savedSearch: SavedSearch },
      SavedSearchPayload
    >({
      query: (payload) => ({
        url: "api/saved-searches",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["SavedSearches"],
    }),

    getSavedSearches: builder.query<
      { message: string; savedSearches: SavedSearch[] },
      { itemType?: "product" | "property"; active?: boolean }
    >({
      query: (params) => ({
        url: "api/saved-searches",
        params,
      }),
      providesTags: ["SavedSearches"],
    }),

    updateSavedSearch: builder.mutation<
      { message: string; savedSearch: SavedSearch },
      { searchId: string; data: Partial<SavedSearchPayload> & { active?: boolean } }
    >({
      query: ({ searchId, data }) => ({
        url: `api/saved-searches/${searchId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["SavedSearches"],
    }),

    deleteSavedSearch: builder.mutation<
      { message: string },
      string
    >({
      query: (searchId) => ({
        url: `api/saved-searches/${searchId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SavedSearches"],
    }),

    triggerSearchCheck: builder.mutation<
      { message: string },
      string
    >({
      query: (searchId) => ({
        url: `api/saved-searches/${searchId}/check`,
        method: "POST",
      }),
      invalidatesTags: ["SavedSearches"],
    }),
  }),
});

export const {
  useTrackBehaviorMutation,
  useGetRecentlyViewedQuery,
  useGetBehaviorInsightsQuery,
  useGetTrendingQuery,
  useGetRecommendationsQuery,
  useGetSimilarQuery,
  useSaveSearchMutation,
  useGetSavedSearchesQuery,
  useUpdateSavedSearchMutation,
  useDeleteSavedSearchMutation,
  useTriggerSearchCheckMutation,
} = marketplaceApi;

