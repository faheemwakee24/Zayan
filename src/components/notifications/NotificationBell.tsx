"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, CheckCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { API_URL } from "@/services/client";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  Notification,
  type NotificationChannel,
} from "@/services/redux/api/notificationApi";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const SOCKET_URL = API_URL.replace(/\/$/, "");

export function NotificationBell({
  channel,
}: {
  /** Filter to show only ecommerce or real-estate notifications. Omit to show all. */
  channel?: NotificationChannel;
} = {}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user._id || user.id || null;
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  useEffect(() => {
    // Sync with localStorage changes if needed
    const handleStorage = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setCurrentUserId(user._id || user.id || null);
        } catch {
          setCurrentUserId(null);
        }
      } else {
        setCurrentUserId(null);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Fetch notifications and unread count (only if user is logged in). Filter by channel when in ecommerce or real-estate flow.
  const { data: notificationsData, refetch: refetchNotifications } =
    useGetNotificationsQuery(
      {
        limit: 20,
        skip: 0,
        ...(channel ? { channel } : {}),
      },
      { skip: !currentUserId },
    );
  const { data: unreadCountData, refetch: refetchUnreadCount } =
    useGetUnreadCountQuery(channel ?? undefined, { skip: !currentUserId });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = notificationsData?.notifications || [];
  const unreadCount = unreadCountData?.unreadCount || 0;

  // Initialize Socket.io connection
  useEffect(() => {
    if (!currentUserId) return;

    const socketInstance = io(SOCKET_URL, {
      path: "/socket.io/",
      withCredentials: true,
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.emit("joinUser", currentUserId);
    socketRef.current = socketInstance;

    // Listen for new notifications
    socketInstance.on("new_notification", () => {
      // Refetch notifications and unread count
      refetchNotifications();
      refetchUnreadCount();
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [currentUserId, refetchNotifications, refetchUnreadCount]);

  // Don't show notification bell if user is not logged in
  if (!currentUserId) {
    return null;
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      try {
        await markAsRead(notification._id).unwrap();
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      setIsOpen(false);
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDeleteNotification = async (
    e: React.MouseEvent,
    notificationId: string,
  ) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId).unwrap();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "new_message":
        return "💬";
      case "new_review":
        return "⭐";
      case "listing_inquiry":
        return "📋";
      case "order_placed":
        return "🛒";
      case "verification_approved":
        return "✅";
      case "verification_rejected":
        return "❌";
      default:
        return "🔔";
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 max-h-[500px] overflow-y-auto"
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-7 text-xs"
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {unreadCount} unread{" "}
              {unreadCount === 1 ? "notification" : "notifications"}
            </p>
          )}
        </div>

        <div className="divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={cn(
                  "p-4 hover:bg-muted/50 transition-colors cursor-pointer relative group",
                  !notification.read && "bg-primary/5",
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            !notification.read &&
                              "font-semibold text-foreground",
                            notification.read && "text-foreground/80",
                          )}
                        >
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                            },
                          )}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    onClick={(e) =>
                      handleDeleteNotification(e, notification._id)
                    }
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setIsOpen(false);
                router.push(
                  channel ? `/notifications?channel=${channel}` : "/notifications",
                );
              }}
            >
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
