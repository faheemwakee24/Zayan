import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../client";

export interface SubscriptionPlan {
  _id: string;
  name: "Basic" | "Pro" | "Premium";
  price: number;
  billingPeriod?: "monthly" | "yearly";
  duration: number;
  features: {
    maxListings: number;
    maxStores: number;
    featuredListingsCount: number;
    boostedVisibility: boolean;
    prioritySupport: boolean;
  };
  targetRole: "ecommerceSeller" | "realEstateSeller" | "both";
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSubscription {
  _id: string;
  userId: string;
  planId: SubscriptionPlan;
  role: "ecommerceSeller" | "realEstateSeller";
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
  autoRenew: boolean;
  usage: {
    listingsUsed: number;
    featuredUsed: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface FeaturedListing {
  _id: string;
  itemType: "product" | "property";
  itemId: string;
  sellerId: string;
  startDate: string;
  endDate: string;
  priorityScore: number;
  isBoosted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlansResponse {
  message?: string;
  plans: SubscriptionPlan[];
}

export interface SubscriptionResponse {
  message?: string;
  subscription: UserSubscription | null;
}

export interface SubscribePayload {
  planId: string;
  role: "ecommerceSeller" | "realEstateSeller";
}

export interface FeatureListingPayload {
  itemId: string;
  itemType: "product" | "property";
  duration?: number;
}

export interface BoostListingPayload {
  itemId: string;
  itemType: "product" | "property";
  duration?: number;
}

export interface FeaturedListingResponse {
  message?: string;
  featuredListing: FeaturedListing;
}

// Helper to get token from localStorage
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("zayanToken");
  }
  return null;
};

export const subscriptionApi = createApi({
  reducerPath: "subscriptionApi",
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
  tagTypes: ["Subscription", "Plan", "FeaturedListing"],
  endpoints: (builder) => ({
    // Get available plans
    getPlans: builder.query<PlansResponse, "ecommerceSeller" | "realEstateSeller">({
      query: (role) => `api/subscriptions/plans?role=${role}`,
      providesTags: ["Plan"],
    }),

    // Subscribe to a plan
    subscribe: builder.mutation<SubscriptionResponse, SubscribePayload>({
      query: (body) => ({
        url: "api/subscriptions/subscribe",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Subscription"],
    }),

    // Get current subscription
    getMySubscription: builder.query<
      SubscriptionResponse,
      "ecommerceSeller" | "realEstateSeller"
    >({
      query: (role) => `api/subscriptions/my-subscription?role=${role}`,
      providesTags: ["Subscription"],
    }),

    // Cancel subscription
    cancelSubscription: builder.mutation<
      SubscriptionResponse,
      { role: "ecommerceSeller" | "realEstateSeller" }
    >({
      query: (body) => ({
        url: "api/subscriptions/cancel",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Subscription"],
    }),

    // Feature a listing
    featureListing: builder.mutation<FeaturedListingResponse, FeatureListingPayload>({
      query: (body) => ({
        url: "api/subscriptions/feature-listing",
        method: "POST",
        body,
      }),
      invalidatesTags: ["FeaturedListing", "Subscription"],
    }),

    // Boost a listing
    boostListing: builder.mutation<FeaturedListingResponse, BoostListingPayload>({
      query: (body) => ({
        url: "api/subscriptions/boost-listing",
        method: "POST",
        body,
      }),
      invalidatesTags: ["FeaturedListing", "Subscription"],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useSubscribeMutation,
  useGetMySubscriptionQuery,
  useCancelSubscriptionMutation,
  useFeatureListingMutation,
  useBoostListingMutation,
} = subscriptionApi;

