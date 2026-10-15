import { useEffect, useRef } from "react";
import { useTrackEventMutation } from "@/services/redux/api/analyticsApi";
import { usePathname } from "next/navigation";

// Generate a session ID
const getSessionId = (): string => {
  if (typeof window !== "undefined") {
    let sessionId = sessionStorage.getItem("analytics_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("analytics_session_id", sessionId);
    }
    return sessionId;
  }
  return "";
};

// Hook for tracking analytics events
export function useAnalytics() {
  const [trackEvent] = useTrackEventMutation();
  const sessionId = useRef<string>(getSessionId());

  const track = async (
    eventType: "view" | "click" | "chat_started" | "message_sent" | "message_received",
    itemType: "product" | "property",
    itemId: string,
    metadata?: Record<string, any>,
    responseTime?: number,
    conversationId?: string
  ) => {
    try {
      await trackEvent({
        eventType,
        itemType,
        itemId,
        sessionId: sessionId.current,
        metadata,
        responseTime,
        conversationId,
      }).unwrap();
    } catch (error) {
      // Silently fail - analytics should not break the app
      console.error("Failed to track event:", error);
    }
  };

  return { track };
}

// Hook to automatically track page views
export function useTrackPageView(
  itemType: "product" | "property" | null,
  itemId: string | null
) {
  const pathname = usePathname();
  const { track } = useAnalytics();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (itemType && itemId && !hasTracked.current) {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        track("view", itemType, itemId, {
          pathname,
          timestamp: new Date().toISOString(),
        });
        hasTracked.current = true;
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [itemType, itemId, pathname, track]);
}

