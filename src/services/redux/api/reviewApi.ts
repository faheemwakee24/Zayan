import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../client";

// Types
export interface ReviewCategoryRatings {
  communication?: number;
  accuracy?: number;
  professionalism?: number;
}

export interface SellerReview {
  _id: string;
  type: "seller";
  seller: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
    email: string;
  };
  rating: number;
  categories?: ReviewCategoryRatings;
  title: string;
  comment: string;
  verified: boolean;
  sellerResponse?: {
    response: string;
    respondedAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReview {
  _id: string;
  type: "product";
  product: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
    email: string;
    verificationStatus?: "pending" | "approved" | "rejected" | null;
    isVerified?: boolean;
  };
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export type Review = SellerReview | ProductReview;

export interface CreateSellerReviewPayload {
  rating: number;
  title?: string;
  comment?: string;
  categories?: ReviewCategoryRatings;
  propertyId?: string;
  productId?: string;
}

export interface SellerReviewsResponse {
  message?: string;
  count: number;
  averageRating: number;
  categoryRatings: {
    communication: number;
    accuracy: number;
    professionalism: number;
  };
  starBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  reviews: SellerReview[];
}

export interface AddSellerResponsePayload {
  response: string;
}

export interface AddSellerResponseResponse {
  message: string;
  review: {
    _id: string;
    sellerResponse: {
      response: string;
      respondedAt: string;
    };
  };
}

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("zayanToken");
  }
  return null;
};

export const reviewApi = createApi({
  reducerPath: "reviewApi",
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
  tagTypes: ["Review", "SellerReviews"],
  endpoints: (builder) => ({
    // Create seller/agent review
    createSellerReview: builder.mutation<
      { message: string; review: SellerReview },
      { sellerId: string; payload: CreateSellerReviewPayload }
    >({
      query: ({ sellerId, payload }) => ({
        url: `api/reviews/seller/${sellerId}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Review", "SellerReviews"],
    }),

    // Get seller/agent reviews
    getSellerReviews: builder.query<SellerReviewsResponse, string>({
      query: (sellerId) => `api/reviews/seller/${sellerId}`,
      providesTags: ["SellerReviews"],
    }),

    // Add seller response to a review
    addSellerResponse: builder.mutation<
      AddSellerResponseResponse,
      { reviewId: string; payload: AddSellerResponsePayload }
    >({
      query: ({ reviewId, payload }) => ({
        url: `api/reviews/${reviewId}/response`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Review", "SellerReviews"],
    }),
  }),
});

export const {
  useCreateSellerReviewMutation,
  useGetSellerReviewsQuery,
  useAddSellerResponseMutation,
} = reviewApi;

