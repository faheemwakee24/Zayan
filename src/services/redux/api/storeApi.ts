import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../client";

export interface Store {
  _id: string;
  name: string;
  description: string;
  location: string;
  bannerImage?: string;
  status?: "active" | "inactive";
  products?: number;
  followers?: number;
  rating?: number;
  views?: number;
  isFollowing?: boolean;
  createdAt?: string;
  updatedAt?: string;
  owner?: {
    _id?: string;
    name?: string;
    email?: string;
    avatar?: string;
    rating?: number;
    phone?: string;
  };
}

export interface StoresResponse {
  message?: string;
  count?: number;
  stores: Store[];
}

export interface BuyerStore extends Store {
  id: string;
  isFollowing?: boolean;
  seller: {
    name: string;
    avatar: string;
    rating: number;
    email: string;
  };
}

export interface BuyerStoresResponse {
  message?: string;
  count?: number;
  stores: BuyerStore[];
}

export interface BuyerStoresQueryParams {
  searchTerm?: string;
  location?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface StoreError {
  message: string;
}

export interface StoreDetailResponse {
  message?: string;
  store: Store;
}

export interface DeleteStoreResponse {
  message: string;
}

export interface FollowStoreResponse {
  message: string;
  followers: number;
  isFollowing: boolean;
}

export interface StorePayload {
  name: string;
  description: string;
  location: string;
  bannerImage?: string;
}

export interface UpdateStoreArgs {
  id: string;
  payload: Partial<StorePayload> & { status?: "active" | "inactive" };
}

export interface CreateStoreResponse {
  message?: string;
  store?: Store;
  [key: string]: unknown;
}

export interface UploadImageResponse {
  url: string;
  [key: string]: unknown;
}

// Helper to get token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("zayanToken");
  }
  return null;
};

export const storeApi = createApi({
  reducerPath: "storeApi",
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
  tagTypes: ["Store"],
  endpoints: (builder) => ({
    // Get all stores (seller's own stores)
    getStores: builder.query<StoresResponse, void>({
      query: () => "api/stores",
      providesTags: ["Store"],
      keepUnusedDataFor: 60,
    }),
    // Get a single store by ID (seller's own store)
    getStoreById: builder.query<StoreDetailResponse, string>({
      query: (id) => `api/stores/${id}`,
      providesTags: (result, error, id) => [{ type: "Store", id }],
      keepUnusedDataFor: 60,
    }),
    // Get a single store by ID for buyer (any active store)
    getStoreByIdForBuyer: builder.query<StoreDetailResponse, string>({
      query: (id) => `api/stores/buyer/${id}`,
      providesTags: (result, error, id) => [{ type: "Store", id }],
      keepUnusedDataFor: 60,
    }),
    // Create a store
    createStore: builder.mutation<CreateStoreResponse, StorePayload>({
      query: (payload) => ({
        url: "api/stores",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Store"],
    }),
    // Delete a store
    deleteStore: builder.mutation<DeleteStoreResponse, string>({
      query: (id) => ({
        url: `api/stores/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Store"],
    }),
    // Update a store
    updateStore: builder.mutation<CreateStoreResponse, UpdateStoreArgs>({
      query: ({ id, payload }) => ({
        url: `api/stores/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Store",
        { type: "Store", id },
      ],
    }),
    // Get all stores for buyer (with filtering)
    getBuyerStores: builder.query<
      BuyerStoresResponse,
      BuyerStoresQueryParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.searchTerm) queryParams.append("searchTerm", params.searchTerm);
          if (params.location) queryParams.append("location", params.location);
          if (params.sortBy) queryParams.append("sortBy", params.sortBy);
          if (params.order) queryParams.append("order", params.order);
        }

        const queryString = queryParams.toString();
        return `api/stores/buyer/all${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Store"],
      keepUnusedDataFor: 60,
    }),
    // Get stores by seller ID
    getStoresBySellerId: builder.query<StoresResponse, string>({
      query: (sellerId) => `api/stores/seller/${sellerId}`,
      providesTags: (result, error, sellerId) => [{ type: "Store", id: `seller-${sellerId}` }],
      keepUnusedDataFor: 60,
    }),
    // Upload store banner image
    uploadStoreBannerImage: builder.mutation<UploadImageResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: "api/upload",
          method: "POST",
          body: formData,
        };
      },
    }),
    // Follow a store
    followStore: builder.mutation<FollowStoreResponse, string>({
      query: (storeId) => ({
        url: `api/stores/buyer/${storeId}/follow`,
        method: "POST",
      }),
      invalidatesTags: (result, error, storeId) => [
        "Store",
        { type: "Store", id: storeId },
      ],
    }),
    // Unfollow a store
    unfollowStore: builder.mutation<FollowStoreResponse, string>({
      query: (storeId) => ({
        url: `api/stores/buyer/${storeId}/unfollow`,
        method: "POST",
      }),
      invalidatesTags: (result, error, storeId) => [
        "Store",
        { type: "Store", id: storeId },
      ],
    }),
  }),
});

export const {
  useGetStoresQuery,
  useGetStoreByIdQuery,
  useGetStoreByIdForBuyerQuery,
  useCreateStoreMutation,
  useDeleteStoreMutation,
  useUpdateStoreMutation,
  useGetBuyerStoresQuery,
  useGetStoresBySellerIdQuery,
  useUploadStoreBannerImageMutation,
  useFollowStoreMutation,
  useUnfollowStoreMutation,
} = storeApi;

