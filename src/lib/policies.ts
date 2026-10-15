export type PolicyType = "privacy" | "terms" | "cookies";

export interface PolicyResponse {
  success: boolean;
  policy?: {
    type: PolicyType;
    content: string;
    version: string;
    lastUpdated: string;
  };
  message?: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_BASE_URL ||
  "https://zayan-backend.vercel.app";

export async function fetchPolicy(type: PolicyType): Promise<PolicyResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/policies/${type}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return { success: false, message: `Failed to load policy: ${res.statusText}` };
    }

    const data = await res.json();

    if (!data?.success || !data?.policy) {
      return { success: false, message: data?.message || "Policy unavailable" };
    }

    return {
      success: true,
      policy: {
        type: data.policy.type,
        content: data.policy.content || "",
        version: data.policy.version || "1.0.0",
        lastUpdated: data.policy.lastUpdated,
      },
    };
  } catch (error: any) {
    console.error("fetchPolicy error:", error);
    return { success: false, message: error?.message || "Unable to load policy" };
  }
}


