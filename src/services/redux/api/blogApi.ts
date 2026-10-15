import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../client";

// Types
export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string | { _id: string; email: string };
  authorName: string;
  category: string;
  featuredImage: string | null;
  status: "draft" | "published" | "archived";
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
  views: number;
  publishedAt: string | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogsResponse {
  success: boolean;
  blogs: Blog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface BlogResponse {
  success: boolean;
  blog: Blog;
}

export interface BlogCategoriesResponse {
  success: boolean;
  categories: Array<{
    name: string;
    count: number;
  }>;
}

export interface GetBlogsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  featured?: boolean;
  type?: "real-estate" | "ecommerce"; // Filter by blog type
}

const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("zayanToken");
  }
  return null;
};

export const blogApi = createApi({
  reducerPath: "blogApi",
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
  tagTypes: ["Blog"],
  endpoints: (builder) => ({
    // Get all published blogs (public)
    getBlogs: builder.query<BlogsResponse, GetBlogsQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) {
          queryParams.append("page", params.page.toString());
        }
        if (params?.limit) {
          queryParams.append("limit", params.limit.toString());
        }
        if (params?.category) {
          queryParams.append("category", params.category);
        }
        if (params?.search) {
          queryParams.append("search", params.search);
        }
        if (params?.featured) {
          queryParams.append("featured", "true");
        }
        if (params?.type) {
          queryParams.append("type", params.type);
        }
        const queryString = queryParams.toString();
        return `api/blogs${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Blog"],
      keepUnusedDataFor: 60,
    }),

    // Get single blog by slug (public)
    getBlogBySlug: builder.query<BlogResponse, string>({
      query: (slug) => `api/blogs/${slug}`,
      providesTags: (result, error, slug) => [{ type: "Blog", id: slug }],
      keepUnusedDataFor: 60,
    }),

    // Get blog categories (public)
    getBlogCategories: builder.query<
      BlogCategoriesResponse,
      { type?: "real-estate" | "ecommerce" } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.type) {
          queryParams.append("type", params.type);
        }
        const queryString = queryParams.toString();
        return `api/blogs/categories${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Blog"],
      keepUnusedDataFor: 300, // Cache categories longer
    }),
  }),
});

export const { useGetBlogsQuery, useGetBlogBySlugQuery, useGetBlogCategoriesQuery } = blogApi;

