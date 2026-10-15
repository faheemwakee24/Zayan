import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../client";

// Types
export interface VerificationDocument {
  url: string;
  fileName?: string;
  mimeType?: string;
}

export interface SubmitVerificationPayload {
  verificationDocuments: string[]; // Array of file URLs
}

export interface VerificationStatusResponse {
  verificationStatus: "pending" | "approved" | "rejected" | null;
  verificationDocuments: string[];
  isVerified: boolean;
}

export interface VerificationRequest {
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  roles: string[];
  verificationStatus: "pending" | "approved" | "rejected";
  verificationDocuments: string[];
  submittedAt: string;
  hasEcommerceSeller: boolean;
  hasRealEstateSeller: boolean;
}

export interface GetVerificationRequestsResponse {
  requests: VerificationRequest[];
  count: number;
}

export interface ApproveVerificationResponse {
  message: string;
  user: {
    _id: string;
    name: string;
    email: string;
    verificationStatus: string;
    isVerified: boolean;
  };
}

export interface RejectVerificationPayload {
  reason?: string;
}

export interface RejectVerificationResponse {
  message: string;
  reason?: string;
  user: {
    _id: string;
    name: string;
    email: string;
    verificationStatus: string;
    isVerified: boolean;
  };
}

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("zayanToken");
  }
  return null;
};

export const verificationApi = createApi({
  reducerPath: "verificationApi",
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
  tagTypes: ["Verification"],
  endpoints: (builder) => ({
    // Submit verification documents (Seller/Agent)
    submitVerification: builder.mutation<
      { message: string; verificationStatus: string; verificationDocuments: string[] },
      SubmitVerificationPayload
    >({
      query: (payload) => ({
        url: "api/verification/submit",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Verification"],
    }),

    // Get verification status (Current user)
    getVerificationStatus: builder.query<VerificationStatusResponse, void>({
      query: () => "api/verification/status",
      providesTags: ["Verification"],
    }),

    // Get all verification requests (Admin only)
    getVerificationRequests: builder.query<GetVerificationRequestsResponse, void>({
      query: () => "api/verification/requests",
      providesTags: ["Verification"],
    }),

    // Approve verification (Admin only)
    approveVerification: builder.mutation<ApproveVerificationResponse, string>({
      query: (userId) => ({
        url: `api/verification/approve/${userId}`,
        method: "POST",
      }),
      invalidatesTags: ["Verification"],
    }),

    // Reject verification (Admin only)
    rejectVerification: builder.mutation<
      RejectVerificationResponse,
      { userId: string; payload?: RejectVerificationPayload }
    >({
      query: ({ userId, payload }) => ({
        url: `api/verification/reject/${userId}`,
        method: "POST",
        body: payload || {},
      }),
      invalidatesTags: ["Verification"],
    }),
  }),
});

export const {
  useSubmitVerificationMutation,
  useGetVerificationStatusQuery,
  useGetVerificationRequestsQuery,
  useApproveVerificationMutation,
  useRejectVerificationMutation,
} = verificationApi;

