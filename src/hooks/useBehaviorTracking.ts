import { useEffect, useRef } from "react";
import { useTrackBehaviorMutation } from "@/services/redux/api/marketplaceApi";

// Helper to get or create a session ID
const getSessionId = (): string => {
  if (typeof window === "undefined") return "server-session";
  let sessionId = localStorage.getItem("behaviorSessionId");
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("behaviorSessionId", sessionId);
  }
  return sessionId;
};

// Hook to track item views
export const useTrackItemView = (
  itemType: "product" | "property",
  itemId: string | undefined,
  enabled: boolean = true
) => {
  const [trackBehavior] = useTrackBehaviorMutation();
  const hasTracked = useRef(false);
  const sessionId = useRef(getSessionId());

  useEffect(() => {
    if (enabled && itemId && !hasTracked.current) {
      trackBehavior({
        itemType,
        itemId,
        action: "view",
        sessionId: sessionId.current,
      });
      hasTracked.current = true;
    }
  }, [itemType, itemId, enabled, trackBehavior]);
};

// Hook to track item clicks
export const useTrackItemClick = (
  itemType: "product" | "property",
  itemId: string | undefined
) => {
  const [trackBehavior] = useTrackBehaviorMutation();
  const sessionId = useRef(getSessionId());

  const trackClick = () => {
    if (itemId) {
      trackBehavior({
        itemType,
        itemId,
        action: "click",
        sessionId: sessionId.current,
      });
    }
  };

  return trackClick;
};

// Hook to track search queries
export const useTrackSearch = () => {
  const [trackBehavior] = useTrackBehaviorMutation();
  const sessionId = useRef(getSessionId());

  const trackSearch = (
    itemType: "product" | "property",
    searchQuery: string,
    searchFilters?: Record<string, any>
  ) => {
    trackBehavior({
      itemType,
      itemId: "search", // Placeholder ID for searches
      action: "search",
      searchQuery,
      searchFilters,
      sessionId: sessionId.current,
    });
  };

  return trackSearch;
};

