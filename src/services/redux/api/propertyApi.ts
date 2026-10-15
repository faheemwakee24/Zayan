import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../client";

export interface Property {
  _id: string;
  title: string;
  description: string;
  location: string;
  city?: string;
  state?: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt?: number;
  propertyType: string;
  amenities?: string[];
  images: string[];
  status?: "active" | "sold" | "pending";
  views?: number;
  inquiries?: number;
  isFeatured?: boolean;
  featuredUntil?: string;
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

export interface PropertiesResponse {
  message?: string;
  count?: number;
  properties: Property[];
}

export interface BuyerProperty extends Property {
  id: string;
  image?: string;
  seller: {
    name: string;
    avatar: string;
    rating: number;
    email: string;
    verificationStatus?: "pending" | "approved" | "rejected" | null;
    isVerified?: boolean;
  };
}

export interface BuyerPropertiesResponse {
  message?: string;
  count?: number;
  properties: BuyerProperty[];
}

export interface BuyerPropertiesQueryParams {
  searchTerm?: string;
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface PropertyError {
  message: string;
}

export interface PropertyDetailResponse {
  message?: string;
  property: Property; // Property already includes owner field
}

export interface DeletePropertyResponse {
  message: string;
}

export interface PropertyPayload {
  title: string;
  description: string;
  location: string;
  city: string;
  state: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt?: number;
  propertyType: string;
  amenities: string[];
  images: string[];
}

export interface UpdatePropertyArgs {
  id: string;
  payload: PropertyPayload;
}

export interface CreatePropertyResponse {
  message?: string;
  property?: Property;
  [key: string]: unknown;
}

export interface UploadImageResponse {
  url: string;
  [key: string]: unknown;
}

export interface SellerProfile {
  id: string;
  _id?: string; // some endpoints return MongoDB-style identifier
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  specialization: string;
  agency: string;
  city: string;
  state: string;
  certifications: string;
  languages: string[];
  avatar: string;
  rating: number;
  totalProperties?: number;
  totalViews?: number;
  // Ecommerce seller specific
  totalStores?: number;
  totalProducts?: number;
  totalFollowers?: number;
  // Verification status (from buildProfileResponse)
  verificationStatus?: "pending" | "approved" | "rejected" | null;
  isVerified?: boolean;
}

export interface SellerProfileResponse {
  message?: string;
  profile: SellerProfile;
}

export interface UpdateSellerProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  specialization?: string;
  agency?: string;
  city?: string;
  state?: string;
  certifications?: string;
  languages?: string[];
  avatar?: string;
}

// Helper to get token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("zayanToken");
  }
  return null;
};

export const propertyApi = createApi({
  reducerPath: "propertyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      // Don't set Content-Type for FormData - browser will set it with boundary
      // RTK Query automatically handles this, but we ensure it's not overridden
      return headers;
    },
  }),
  tagTypes: ["Property", "Profile", "Auth"],
  endpoints: (builder) => ({
    // Get all properties (seller's own properties)
    getProperties: builder.query<PropertiesResponse, void>({
      query: () => "api/properties",
      providesTags: ["Property"],
      // Cache for 60 seconds, but allow refetch if needed
      keepUnusedDataFor: 60,
    }),
    // Get a single property by ID (seller's own property)
    getPropertyById: builder.query<PropertyDetailResponse, string>({
      query: (id) => `api/properties/${id}`,
      providesTags: (result, error, id) => [{ type: "Property", id }],
      keepUnusedDataFor: 60,
    }),
    // Get a single property by ID for buyer (any active property)
    getPropertyByIdForBuyer: builder.query<PropertyDetailResponse, string>({
      query: (id) => `api/properties/buyer/${id}`,
      providesTags: (result, error, id) => [{ type: "Property", id }],
      keepUnusedDataFor: 60,
    }),
    // Create a property
    createProperty: builder.mutation<CreatePropertyResponse, PropertyPayload>({
      query: (payload) => ({
        url: "api/properties",
        method: "POST",
        body: payload,
      }),
      // Invalidate cache so properties list refetches automatically
      invalidatesTags: ["Property"],
    }),
    // Delete a property
    deleteProperty: builder.mutation<DeletePropertyResponse, string>({
      query: (id) => ({
        url: `api/properties/${id}`,
        method: "DELETE",
      }),
      // Invalidate cache so properties refetch
      invalidatesTags: ["Property"],
    }),
    // Update a property
    updateProperty: builder.mutation<CreatePropertyResponse, UpdatePropertyArgs>({
      query: ({ id, payload }) => ({
        url: `api/properties/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Property",
        { type: "Property", id },
      ],
    }),
    // Upload property image
    uploadPropertyImage: builder.mutation<UploadImageResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: "api/upload",
          method: "POST",
          body: formData,
          // RTK Query will automatically handle FormData and set proper headers
        };
      },
    }),
    // Get seller profile (current user's own profile)
    getSellerProfile: builder.query<SellerProfileResponse, string | void>({
      query: (role = "realestate_seller") => {
        const params = role ? `?role=${role}` : "";
        return `api/profile${params}`;
      },
      providesTags: ["Profile"],
    }),
    // Get seller profile by ID (for buyers to view seller profiles)
    getSellerProfileById: builder.query<SellerProfileResponse, { id: string; role?: string }>({
      query: ({ id, role = "realestate_seller" }) => {
        const params = role ? `?role=${role}` : "";
        return `api/profile/${id}${params}`;
      },
      providesTags: (result, error, { id }) => [{ type: "Profile", id }],
    }),
    // Update seller profile
    updateSellerProfile: builder.mutation<
      SellerProfileResponse,
      UpdateSellerProfilePayload & { role?: string }
    >({
      query: (payload) => {
        const { role, ...body } = payload;
        const params = role ? `?role=${encodeURIComponent(role)}` : "";
        
        return {
          url: `api/profile${params}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Profile", "Auth"], // Invalidate both Profile and Auth tags
    }),
    // Get all properties for buyer (with filtering)
    getBuyerProperties: builder.query<
      BuyerPropertiesResponse,
      BuyerPropertiesQueryParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.searchTerm) queryParams.append("searchTerm", params.searchTerm);
          if (params.city) queryParams.append("city", params.city);
          if (params.state) queryParams.append("state", params.state);
          if (params.minPrice) queryParams.append("minPrice", params.minPrice.toString());
          if (params.maxPrice) queryParams.append("maxPrice", params.maxPrice.toString());
          if (params.beds) queryParams.append("beds", params.beds.toString());
          if (params.baths) queryParams.append("baths", params.baths.toString());
          if (params.sortBy) queryParams.append("sortBy", params.sortBy);
          if (params.order) queryParams.append("order", params.order);
        }

        const queryString = queryParams.toString();
        return `api/properties/buyer/all${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Property"],
      keepUnusedDataFor: 60,
    }),
    // Get properties by seller ID
    getPropertiesBySellerId: builder.query<PropertiesResponse, string>({
      query: (sellerId) => `api/properties/seller/${sellerId}`,
      providesTags: (result, error, sellerId) => [{ type: "Property", id: `seller-${sellerId}` }],
      keepUnusedDataFor: 60,
    }),
    // Get top sellers
    getTopSellers: builder.query<
      { message?: string; sellers: Array<SellerProfile & { name: string; reviews: number }> },
      { role?: string; limit?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.role) queryParams.append("role", params.role);
          if (params.limit) queryParams.append("limit", params.limit.toString());
        }
        const queryString = queryParams.toString();
        return `api/profile/top-sellers${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Profile"],
      keepUnusedDataFor: 60,
    }),
  }),
});

export const {
  useGetPropertiesQuery,
  useGetPropertyByIdQuery,
  useGetPropertyByIdForBuyerQuery,
  useCreatePropertyMutation,
  useDeletePropertyMutation,
  useUpdatePropertyMutation,
  useUploadPropertyImageMutation,
  useGetSellerProfileQuery,
  useGetSellerProfileByIdQuery,
  useUpdateSellerProfileMutation,
  useGetBuyerPropertiesQuery,
  useGetPropertiesBySellerIdQuery,
  useGetTopSellersQuery,
} = propertyApi;

