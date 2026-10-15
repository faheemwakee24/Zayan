import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../client";

export interface CreatePaymentIntentPayload {
  planId: string;
  role: "ecommerceSeller" | "realEstateSeller";
}

export interface CreatePaymentIntentResponse {
  freePlan?: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  message?: string;
}

// Helper to get token from localStorage
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("zayanToken");
  }
  return null;
};

export const paymentApi = createApi({
  reducerPath: "paymentApi",
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
  tagTypes: ["Payment"],
  endpoints: (builder) => ({
    // Create payment intent
    createPaymentIntent: builder.mutation<
      CreatePaymentIntentResponse,
      CreatePaymentIntentPayload
    >({
      query: (body) => ({
        url: "api/payments/create-intent",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCreatePaymentIntentMutation } = paymentApi;

