import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../client";

// Helper to get token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("zayanToken");
  }
  return null;
};

export interface GenerateProductDescriptionPayload {
  name: string;
  category?: string;
  price?: number;
  currency?: string;
  unit?: string;
  stock?: number;
  customPrompt?: string;
}

export interface GeneratePropertyDescriptionPayload {
  title: string;
  location?: string;
  city?: string;
  state?: string;
  propertyType?: string;
  price?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  yearBuilt?: number;
  amenities?: string[];
  customPrompt?: string;
}

export interface GenerateProfileBioPayload {
  firstName: string;
  lastName: string;
  specialization?: string;
  agency?: string;
  city?: string;
  state?: string;
  certifications?: string;
  languages?: string[];
  customPrompt?: string;
}

export interface SuggestPricingPayload {
  itemType: "product" | "property";
  customPrompt?: string;
  [key: string]: any; // Allow flexible item info
}

export interface ChatAssistantPayload {
  itemType: "product" | "property";
  question: string;
  [key: string]: any; // Item information
}

export interface AIResponse {
  message: string;
  description?: string;
  answer?: string;
  suggestedPrice?: number;
  explanation?: string;
  available: boolean;
}

export const aiApi = createApi({
  reducerPath: "aiApi",
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
  tagTypes: ["AI"],
  endpoints: (builder) => ({
    checkAiAvailability: builder.query<{ available: boolean; message: string }, void>({
      query: () => "api/ai/availability",
      providesTags: ["AI"],
    }),
    generateProductDescription: builder.mutation<AIResponse, GenerateProductDescriptionPayload>({
      query: (payload) => ({
        url: "api/ai/product/description",
        method: "POST",
        body: payload,
      }),
    }),
    generatePropertyDescription: builder.mutation<AIResponse, GeneratePropertyDescriptionPayload>({
      query: (payload) => ({
        url: "api/ai/property/description",
        method: "POST",
        body: payload,
      }),
    }),
    suggestPricing: builder.mutation<AIResponse, SuggestPricingPayload>({
      query: (payload) => ({
        url: "api/ai/pricing/suggest",
        method: "POST",
        body: payload,
      }),
    }),
    chatAssistant: builder.mutation<AIResponse, ChatAssistantPayload>({
      query: (payload) => ({
        url: "api/ai/chat",
        method: "POST",
        body: payload,
      }),
    }),
    generateProfileBio: builder.mutation<AIResponse, GenerateProfileBioPayload>({
      query: (payload) => ({
        url: "api/ai/profile/bio",
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useCheckAiAvailabilityQuery,
  useGenerateProductDescriptionMutation,
  useGeneratePropertyDescriptionMutation,
  useSuggestPricingMutation,
  useChatAssistantMutation,
  useGenerateProfileBioMutation,
} = aiApi;

