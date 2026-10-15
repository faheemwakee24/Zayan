import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../client";

// Types
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  address: string;
  country: string;
  state: string;
  city: string;
  // Track which legal policies the user accepted at signup
  acceptedPolicies?: {
    privacy?: boolean;
    terms?: boolean;
    cookies?: boolean;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface AssignRolesPayload {
  ecommerceBuyer: boolean;
  ecommerceSeller: boolean;
  realEstateBuyer: boolean;
  realEstateSeller: boolean;
}

export interface AuthResponse {
  message?: string;
  token?: string;
  user?: {
    roles?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface AuthError {
  message: string;
  [key: string]: unknown;
}

export interface UserProfile {
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  avatar?: string;
  roles?: string[];
  bio?: string;
  specialization?: string;
  agency?: string;
  certifications?: string;
  languages?: string[];
  rating?: number;
  country?: string;
  state?: string;
  city?: string;
  location?: string;
  joinDate?: string;
  isVerified?: boolean;
  verificationStatus?: "pending" | "approved" | "rejected" | null;
  verificationDocuments?: string[];
  createdAt?: string;
  updatedAt?: string;
  accountStatus?: "active" | "suspended" | "banned";
  suspendedAt?: string;
  bannedAt?: string;
  suspensionReason?: string;
  banReason?: string;
  disabledRoles?: string[];
  profiles?: {
    realestate_seller?: {
      rating?: number;
    };
    realestate_buyer?: {
      rating?: number;
    };
    ecommerce_seller?: {
      rating?: number;
    };
    ecommerce_buyer?: {
      rating?: number;
    };
  };
}

export interface GetCurrentUserResponse {
  message?: string;
  user: UserProfile;
}

// Helper to get token from localStorage (for future use if needed)
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("zayanToken");
  }
  return null;
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      // For auth endpoints, we typically don't need a token
      // But if we do in the future, we can add it here
      const token = getAuthToken();
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  // Auth operations typically don't need caching, but we can tag them if needed
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    // Register endpoint
    register: builder.mutation<AuthResponse, RegisterPayload>({
      query: (payload) => ({
        url: "api/auth/register",
        method: "POST",
        body: payload,
      }),
    }),

    // Login endpoint
    login: builder.mutation<AuthResponse, LoginPayload>({
      query: (payload) => ({
        url: "api/auth/login",
        method: "POST",
        body: payload,
      }),
    }),

    // Verify OTP endpoint
    verifyOtp: builder.mutation<AuthResponse, VerifyOtpPayload>({
      query: (payload) => ({
        url: "api/auth/verify-otp",
        method: "POST",
        body: payload,
      }),
    }),

    // Resend OTP endpoint
    resendOtp: builder.mutation<AuthResponse, ResendOtpPayload>({
      query: (payload) => ({
        url: "api/auth/resend-otp",
        method: "POST",
        body: payload,
      }),
    }),

    // Assign roles endpoint
    assignRoles: builder.mutation<AuthResponse, AssignRolesPayload>({
      query: (payload) => ({
        url: "api/auth/assign-roles",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Auth"],
    }),
    requestPasswordResetOtp: builder.mutation<{ message?: string }, { email: string }>({
      query: (body) => ({
        url: "api/auth/forgot-password/request-otp",
        method: "POST",
        body,
      }),
    }),
    verifyPasswordResetOtp: builder.mutation<{ message?: string }, { email: string; otp: string }>({
      query: (body) => ({
        url: "api/auth/forgot-password/verify-otp",
        method: "POST",
        body,
      }),
    }),
    resetPasswordWithOtp: builder.mutation<
      { message?: string },
      { email: string; newPassword: string }
    >({
      query: (body) => ({
        url: "api/auth/forgot-password/reset",
        method: "POST",
        body,
      }),
    }),
    // Get current user profile
    getCurrentUser: builder.query<GetCurrentUserResponse, string | void>({
      query: (role) => {
        const params = role ? `?role=${role}` : "";
        return `api/auth/me${params}`;
      },
      providesTags: ["Auth"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useRegisterMutation,
  useLoginMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useAssignRolesMutation,
  useGetCurrentUserQuery,
  useRequestPasswordResetOtpMutation,
  useVerifyPasswordResetOtpMutation,
  useResetPasswordWithOtpMutation,
} = authApi;

