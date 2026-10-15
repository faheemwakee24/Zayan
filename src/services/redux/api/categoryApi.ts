import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../client";

export interface Category {
  _id: string;
  store: string | {
    _id: string;
    name: string;
  };
  owner: string;
  name: string;
  description?: string;
  icon?: string;
  products?: number;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoriesResponse {
  message?: string;
  count?: number;
  categories: Category[];
}

export interface CategoryError {
  message: string;
}

export interface CategoryDetailResponse {
  message?: string;
  category: Category;
}

export interface DeleteCategoryResponse {
  message: string;
}

export interface CategoryPayload {
  store: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface UpdateCategoryArgs {
  id: string;
  payload: Partial<CategoryPayload> & { status?: "active" | "inactive" };
}

export interface CreateCategoryResponse {
  message?: string;
  category?: Category;
  [key: string]: unknown;
}

export interface UploadImageResponse {
  url: string;
  [key: string]: unknown;
}

export interface GetCategoriesQueryParams {
  store?: string;
}

// Helper to get token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("zayanToken");
  }
  return null;
};

export const categoryApi = createApi({
  reducerPath: "categoryApi",
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
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    // Get all categories (user's own categories)
    getCategories: builder.query<
      CategoriesResponse,
      GetCategoriesQueryParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.store) {
          queryParams.append("store", params.store);
        }
        const queryString = queryParams.toString();
        return `api/categories${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Category"],
      keepUnusedDataFor: 60,
    }),
    // Get a single category by ID
    getCategoryById: builder.query<CategoryDetailResponse, string>({
      query: (id) => `api/categories/${id}`,
      providesTags: (result, error, id) => [{ type: "Category", id }],
      keepUnusedDataFor: 60,
    }),
    // Create a category
    createCategory: builder.mutation<CreateCategoryResponse, CategoryPayload>({
      query: (payload) => ({
        url: "api/categories",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Category"],
    }),
    // Delete a category
    deleteCategory: builder.mutation<DeleteCategoryResponse, string>({
      query: (id) => ({
        url: `api/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
    // Update a category
    updateCategory: builder.mutation<CreateCategoryResponse, UpdateCategoryArgs>({
      query: ({ id, payload }) => ({
        url: `api/categories/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Category",
        { type: "Category", id },
      ],
    }),
    // Upload category icon image
    uploadCategoryIcon: builder.mutation<UploadImageResponse, File>({
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
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
  useUploadCategoryIconMutation,
} = categoryApi;

