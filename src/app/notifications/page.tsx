"use client";

import { useState, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, X, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  Notification,
  type NotificationChannel,
} from "@/services/redux/api/notificationApi";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

function NotificationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const channelParam = searchParams?.get("channel") ?? null;
  const channel: NotificationChannel | undefined =
    channelParam === "ecommerce" || channelParam === "real-estate"
      ? channelParam
      : undefined;
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data: notificationsData, refetch } = useGetNotificationsQuery({
    limit: 100,
    skip: 0,
    read: filter === "unread" ? false : undefined,
    ...(channel ? { channel } : {}),
  });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await markAsRead(notification._id).unwrap();
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId).unwrap();
      refetch();
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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="mr-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
              <p className="text-muted-foreground mt-1">
                {channel
                  ? `Showing ${channel === "ecommerce" ? "ecommerce" : "real estate"} only`
                  : unreadCount > 0
                    ? `${unreadCount} unread ${unreadCount === 1 ? "notification" : "notifications"}`
                    : "All caught up!"}
              </p>
              {channel && unreadCount > 0 && (
                <p className="text-muted-foreground text-sm mt-0.5">
                  {unreadCount} unread
                </p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead} className="gap-2">
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            onClick={() => setFilter("unread")}
          >
            Unread ({unreadCount})
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-foreground mb-2">No Notifications</h3>
              <p className="text-muted-foreground">
                {filter === "unread"
                  ? "You have no unread notifications."
                  : "You don't have any notifications yet."}
              </p>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification._id}
                className={cn(
                  "p-6 hover:shadow-md transition-shadow cursor-pointer",
                  !notification.read && "border-l-4 border-l-primary bg-primary/5"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={cn(
                              "text-lg font-semibold",
                              !notification.read && "text-foreground",
                              notification.read && "text-foreground/80"
                            )}
                          >
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <p className="text-muted-foreground mb-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification._id);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading notifications…</div>
        </div>
      }
    >
      <NotificationsContent />
    </Suspense>
  );
}

