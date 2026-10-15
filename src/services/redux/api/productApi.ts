import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../client";

export interface Product {
  _id: string;
  store: string | {
    _id: string;
    name: string;
    location?: string;
    bannerImage?: string;
    rating?: number;
  };
  category: string | {
    _id: string;
    name: string;
    icon?: string;
  };
  owner: string | {
    _id: string;
    firstName?: string;
    lastName?: string;
  };
  name: string;
  description?: string;
  price: number;
  currency?: string;
  unit?: string;
  images?: string[];
  stock?: number;
  sku?: string;
  status?: "active" | "inactive" | "out_of_stock";
  sales?: number;
  rating?: number;
  views?: number;
  likes?: number;
  isLiked?: boolean;
  isFeatured?: boolean;
  featuredUntil?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsResponse {
  message?: string;
  count?: number;
  products: Product[];
}

export interface ProductError {
  message: string;
}

export interface ProductDetailResponse {
  message?: string;
  product: Product & {
    reviewsCount?: number;
    sellerInfo?: {
      name: string;
      avatar: string;
      rating: number;
      email: string;
    };
  };
}

export interface DeleteProductResponse {
  message: string;
}

export interface ProductPayload {
  store: string;
  category: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  unit?: string;
  images?: string[];
  stock?: number;
  sku?: string;
  status?: "active" | "inactive" | "out_of_stock";
}

export interface UpdateProductArgs {
  id: string;
  payload: Partial<ProductPayload>;
}

export interface CreateProductResponse {
  message?: string;
  product?: Product;
  [key: string]: unknown;
}

export interface UploadImageResponse {
  url: string;
  [key: string]: unknown;
}

export interface GetProductsQueryParams {
  store?: string;
  category?: string;
}

export interface BuyerProductsQueryParams {
  searchTerm?: string;
  category?: string;
  store?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  minPrice?: string;
  maxPrice?: string;
}

export interface Review {
  _id: string;
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

export interface ReviewsResponse {
  message?: string;
  count?: number;
  reviews: Review[];
}

export interface CreateReviewPayload {
  rating: number;
  title?: string;
  comment?: string;
}

export interface CreateReviewResponse {
  message?: string;
  review: Review;
}

export interface LikeProductResponse {
  message?: string;
  likes: number;
  isLiked: boolean;
}

// Helper to get token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("zayanToken");
  }
  return null;
};

export const productApi = createApi({
  reducerPath: "productApi",
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
  tagTypes: ["Product", "Review"],
  endpoints: (builder) => ({
    // Get all products (user's own products)
    getProducts: builder.query<
      ProductsResponse,
      GetProductsQueryParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.store) {
          queryParams.append("store", params.store);
        }
        if (params?.category) {
          queryParams.append("category", params.category);
        }
        const queryString = queryParams.toString();
        return `api/products${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Product"],
      keepUnusedDataFor: 60,
    }),
    // Get a single product by ID
    getProductById: builder.query<ProductDetailResponse, string>({
      query: (id) => `api/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
      keepUnusedDataFor: 60,
    }),
    // Get a single product by ID for buyer (any active product)
    getProductByIdForBuyer: builder.query<ProductDetailResponse, string>({
      query: (id) => `api/products/buyer/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
      keepUnusedDataFor: 60,
    }),
    // Create a product
    createProduct: builder.mutation<CreateProductResponse, ProductPayload>({
      query: (payload) => ({
        url: "api/products",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Product"],
    }),
    // Delete a product
    deleteProduct: builder.mutation<DeleteProductResponse, string>({
      query: (id) => ({
        url: `api/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
    // Update a product
    updateProduct: builder.mutation<CreateProductResponse, UpdateProductArgs>({
      query: ({ id, payload }) => ({
        url: `api/products/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Product",
        { type: "Product", id },
      ],
    }),
    // Upload product image
    uploadProductImage: builder.mutation<UploadImageResponse, File>({
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
    // Get products by store ID for buyers
    getProductsByStoreId: builder.query<
      ProductsResponse,
      { storeId: string; searchTerm?: string; category?: string; sortBy?: string; order?: "asc" | "desc" }
    >({
      query: ({ storeId, searchTerm, category, sortBy, order }) => {
        const queryParams = new URLSearchParams();
        if (searchTerm) queryParams.append("searchTerm", searchTerm);
        if (category) queryParams.append("category", category);
        if (sortBy) queryParams.append("sortBy", sortBy);
        if (order) queryParams.append("order", order);
        const queryString = queryParams.toString();
        return `api/products/buyer/store/${storeId}${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: (result, error, { storeId }) => [{ type: "Product", id: `store-${storeId}` }],
      keepUnusedDataFor: 60,
    }),
    // Get all products for buyers
    getAllProductsForBuyer: builder.query<
      ProductsResponse,
      BuyerProductsQueryParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.searchTerm) queryParams.append("searchTerm", params.searchTerm);
          if (params.category) queryParams.append("category", params.category);
          if (params.store) queryParams.append("store", params.store);
          if (params.sortBy) queryParams.append("sortBy", params.sortBy);
          if (params.order) queryParams.append("order", params.order);
          if (params.minPrice) queryParams.append("minPrice", params.minPrice);
          if (params.maxPrice) queryParams.append("maxPrice", params.maxPrice);
        }
        const queryString = queryParams.toString();
        return `api/products/buyer/all${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Product"],
      keepUnusedDataFor: 60,
    }),
    // Get reviews for a product
    getProductReviews: builder.query<ReviewsResponse, string>({
      query: (id) => `api/products/buyer/${id}/reviews`,
      providesTags: (result, error, id) => [{ type: "Review", id: `product-${id}` }],
      keepUnusedDataFor: 60,
    }),
    // Create a review for a product
    createProductReview: builder.mutation<CreateReviewResponse, { id: string; payload: CreateReviewPayload }>({
      query: ({ id, payload }) => ({
        url: `api/products/buyer/${id}/review`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Product",
        "Review",
        { type: "Product", id },
        { type: "Review", id: `product-${id}` },
      ],
    }),
    // Like a product
    likeProduct: builder.mutation<LikeProductResponse, string>({
      query: (id) => ({
        url: `api/products/buyer/${id}/like`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        "Product",
        { type: "Product", id },
      ],
    }),
    // Unlike a product
    unlikeProduct: builder.mutation<LikeProductResponse, string>({
      query: (id) => ({
        url: `api/products/buyer/${id}/unlike`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        "Product",
        { type: "Product", id },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductByIdForBuyerQuery,
  useCreateProductMutation,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useUploadProductImageMutation,
  useGetProductsByStoreIdQuery,
  useGetAllProductsForBuyerQuery,
  useGetProductReviewsQuery,
  useCreateProductReviewMutation,
  useLikeProductMutation,
  useUnlikeProductMutation,
} = productApi;

