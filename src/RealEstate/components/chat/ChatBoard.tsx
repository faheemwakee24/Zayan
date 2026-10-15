"use client";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Search,
  Send,
  Phone,
  Info,
  Loader2,
  FileText,
  Image as ImageIcon,
  ArrowLeft,
  MessageCircle,
  Flag,
  Building2,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetCurrentUserQuery } from "@/services/redux/api/authApi";
import {
  useGetUserConversationsQuery,
  useGetConversationMessagesQuery,
  useSendMessageMutation,
  useUpdateLastSeenMutation,
  Conversation,
  Message,
} from "@/services/redux/api/chatApi";
import { useToast } from "@/hooks/use-toast";
import { io, Socket } from "socket.io-client";
import { API_URL } from "@/services/client";
import { useRouter } from "next/navigation";
import { ReportChatModal } from "@/components/chat/ReportChatModal";

const SOCKET_URL = API_URL.replace(/\/$/, "");
const UPLOAD_URL = `${SOCKET_URL}/api/upload`;

interface ChatBoardProps {
  role:
    | "realestate_buyer"
    | "realestate_seller"
    | "ecommerce_buyer"
    | "ecommerce_seller";
  conversationId?: string;
  className?: string;
  emptyCopy?: {
    title: string;
    description: string;
  };
}

const formatTime = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getAvatarFallback = (name?: string) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((segment) => segment.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const Avatar = ({
  name,
  avatar,
  size = "w-12 h-12",
  isActive = false,
}: {
  name?: string | null;
  avatar?: string | null;
  size?: string;
  isActive?: boolean;
}) => {
  const initials = getAvatarFallback(name ?? undefined);
  const isImage = avatar && avatar.startsWith("http");

  return (
    <div className={cn(size, "rounded-[20px] relative shrink-0 group")}>
      <div className="h-full w-full rounded-[20px] overflow-hidden bg-[#0f4656]/5 border-2 border-white shadow-md ring-1 ring-[#0f4656]/5">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt={name ?? "User avatar"}
            className="h-full w-full object-cover transition-transform group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white bg-gradient-to-br from-[#ef864c] to-[#d9723f]">
            <span className="text-xs font-black tracking-tighter">
              {initials}
            </span>
          </div>
        )}
      </div>
      {isActive && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm animate-pulse"></div>
      )}
    </div>
  );
};

const getAttachmentLabel = (
  fileName?: string | null,
  mimeType?: string | null,
) => {
  if (fileName) return fileName;
  if (mimeType) {
    const suffix = mimeType.split("/").pop();
    if (suffix) return suffix.toUpperCase();
  }
  return "Attachment";
};

const formatDuration = (minutes: number) => {
  if (!isFinite(minutes) || minutes < 0) return null;
  if (minutes < 1) {
    // For very fast responses, show seconds
    const seconds = Math.round(minutes * 60);
    return seconds < 1
      ? "< 1 sec"
      : `${seconds} sec${seconds !== 1 ? "s" : ""}`;
  }
  if (minutes < 60)
    return `${Math.round(minutes)} min${minutes >= 1 ? "s" : ""}`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours)} hr${hours >= 1 ? "s" : ""}`;
  const days = hours / 24;
  return `${Math.round(days)} day${days >= 1 ? "s" : ""}`;
};

const isUserActive = (lastSeenString?: string | null): boolean => {
  if (!lastSeenString) return false;
  const lastSeen = new Date(lastSeenString);
  const now = new Date();
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  return diffMins < 1;
};

const formatLastSeen = (lastSeenString?: string | null) => {
  if (!lastSeenString) return null;
  const lastSeen = new Date(lastSeenString);
  const now = new Date();
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  // If less than 1 minute, show as "Active now"
  if (diffMins < 1) return "Active now";

  // Format time as "4:51 PM"
  const timeStr = lastSeen.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Check if it's today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastSeenDate = new Date(lastSeen);
  lastSeenDate.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(
    (today.getTime() - lastSeenDate.getTime()) / 86400000,
  );

  if (diffDays === 0) {
    return `today at ${timeStr}`;
  } else if (diffDays === 1) {
    return `yesterday at ${timeStr}`;
  } else if (diffDays < 7) {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = dayNames[lastSeen.getDay()];
    return `${dayName} at ${timeStr}`;
  } else {
    // For older dates, show date
    const dateStr = lastSeen.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year:
        lastSeen.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
    return `${dateStr} at ${timeStr}`;
  }
};

const getSellerResponseTime = (msgs: Message[], sellerId?: string | null) => {
  if (!sellerId || !msgs.length) return null;
  const diffs: number[] = [];
  for (let i = 0; i < msgs.length; i++) {
    const buyerMessage = msgs[i];
    if (buyerMessage.senderId === sellerId) continue;
    const sellerReply = msgs
      .slice(i + 1)
      .find((msg) => msg.senderId === sellerId);
    if (!sellerReply) continue;
    const diffMinutes =
      (new Date(sellerReply.createdAt).getTime() -
        new Date(buyerMessage.createdAt).getTime()) /
      60000;
    if (diffMinutes >= 0) {
      diffs.push(diffMinutes);
    }
  }
  if (!diffs.length) return null;
  return diffs.reduce((sum, value) => sum + value, 0) / diffs.length;
};

export function ChatBoard({
  role,
  conversationId,
  className,
  emptyCopy,
}: ChatBoardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(conversationId ?? null);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const {
    data: currentUserData,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useGetCurrentUserQuery(role);

  const currentUserId = currentUserData?.user?._id;
  const currentUserLabel = role?.includes("buyer") ? "buyer" : "seller";
  const isRealEstate = role?.includes("realestate");

  const baseRoute = isRealEstate
    ? role === "realestate_buyer"
      ? "/real-estate/buyer/messages"
      : "/real-estate/seller/messages"
    : role === "ecommerce_buyer"
      ? "/ecommerce/buyer/messages"
      : "/ecommerce/seller/messages";

  const {
    data: conversationsData,
    isLoading: isConversationsLoading,
    refetch: refetchConversations,
  } = useGetUserConversationsQuery(role ? { role } : undefined, {
    skip: !currentUserId,
  });

  const conversations = useMemo(
    () => conversationsData?.conversations ?? [],
    [conversationsData],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const updateMatch = (event: MediaQueryList | MediaQueryListEvent) => {
      const matches =
        "matches" in event ? event.matches : (event as MediaQueryList).matches;
      setIsDesktop(matches);
    };

    updateMatch(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateMatch);
    } else {
      // Safari fallback
      mediaQuery.addListener(updateMatch);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", updateMatch);
      } else {
        mediaQuery.removeListener(updateMatch);
      }
    };
  }, []);

  useEffect(() => {
    if (isDesktop) {
      setIsMobileListVisible(true);
    }
  }, [isDesktop]);

  useEffect(() => {
    if (conversationId) {
      setSelectedConversationId(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  useEffect(() => {
    if (selectedConversationId && !isDesktop) {
      setIsMobileListVisible(false);
    }
  }, [selectedConversationId, isDesktop]);

  const activeConversation: Conversation | null = useMemo(() => {
    if (!selectedConversationId) return null;
    return (
      conversations.find(
        (conversation) => conversation.id === selectedConversationId,
      ) ?? null
    );
  }, [conversations, selectedConversationId]);

  const partner = useMemo(() => {
    if (!activeConversation || !currentUserId) return null;
    return activeConversation.buyer?.id === currentUserId
      ? activeConversation.seller
      : activeConversation.buyer;
  }, [activeConversation, currentUserId]);

  const computedSellerResponseMinutes = useMemo(() => {
    const sellerId = activeConversation?.seller?.id;
    return getSellerResponseTime(messages, sellerId);
  }, [activeConversation?.seller?.id, messages]);

  const storedSellerResponseMinutes =
    activeConversation?.seller &&
    "averageResponseMinutes" in activeConversation.seller &&
    typeof activeConversation.seller.averageResponseMinutes === "number"
      ? activeConversation.seller.averageResponseMinutes
      : null;

  const sellerResponseTime = useMemo(() => {
    const minutes =
      storedSellerResponseMinutes ?? computedSellerResponseMinutes;
    return minutes != null ? formatDuration(minutes) : null;
  }, [storedSellerResponseMinutes, computedSellerResponseMinutes]);

  const { data: conversationMessages, isFetching: isMessagesLoading } =
    useGetConversationMessagesQuery(activeConversation?.id ?? skipToken);

  useEffect(() => {
    if (conversationMessages?.messages) {
      setMessages(conversationMessages.messages);
    } else {
      setMessages([]);
    }
  }, [conversationMessages]);

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
    setSocket(socketInstance);
    return () => {
      socketInstance.disconnect();
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!socket || !activeConversation?.id) return;
    const roomId = activeConversation.id;
    socket.emit("joinConversation", roomId);
    return () => {
      socket.emit("leaveConversation", roomId);
    };
  }, [socket, activeConversation?.id]);

  useEffect(() => {
    if (!socket) return;

    // const handleNewMessage = (incoming: Message) => {
    //   if (incoming.conversationId === activeConversation?.id) {
    //     setMessages((prev) => {
    //       if (prev.some((msg) => msg.id === incoming.id)) return prev;
    //       return [...prev, incoming];
    //     });

    //     // 🛑 Only refetch if message is NOT from current user
    //     if (incoming.senderId !== currentUserId) {
    //       refetchConversations();
    //     }
    //   } else {
    //     refetchConversations();
    //   }

    // };
    const handleNewMessage = (incoming: Message) => {
      // 🛑 Skip messages from current user (optimistic UI already added it)
      if (incoming.senderId === currentUserId) return;

      if (incoming.conversationId === activeConversation?.id) {
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === incoming.id)) return prev;
          return [...prev, incoming];
        });
      }

      if (currentUserId && refetchConversations) {
        refetchConversations();
      }
    };

    const handleNotification = ({
      conversationId: incomingConversationId,
      message,
    }: {
      conversationId: string;
      message: Message;
    }) => {
      if (incomingConversationId !== activeConversation?.id) {
        if (currentUserId && refetchConversations) {
          refetchConversations();
        }
        toast({
          title: "New message",
          description: message.message,
        });
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("notification", handleNotification);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("notification", handleNotification);
    };
  }, [
    socket,
    activeConversation?.id,
    refetchConversations,
    toast,
    currentUserId,
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [sendMessage] = useSendMessageMutation();
  const [updateLastSeen] = useUpdateLastSeenMutation();

  // Update lastSeen when user opens chat page (for the active conversation)
  useEffect(() => {
    if (currentUserId && activeConversation?.id) {
      updateLastSeen({ conversationId: activeConversation.id });
    }
  }, [currentUserId, activeConversation?.id, updateLastSeen]);

  // Update lastSeen periodically when user is active in chat
  useEffect(() => {
    if (!activeConversation?.id) return;

    // Update immediately when conversation is opened
    updateLastSeen({ conversationId: activeConversation.id });

    // Update every 30 seconds while user is in chat
    const interval = setInterval(() => {
      updateLastSeen({ conversationId: activeConversation.id });
    }, 30000);

    return () => clearInterval(interval);
  }, [activeConversation?.id, updateLastSeen]);

  // Refetch conversations periodically to update lastSeen status
  useEffect(() => {
    if (!activeConversation?.id || !currentUserId) return;

    // Refetch conversations every 10 seconds to update active status
    const interval = setInterval(() => {
      if (currentUserId && refetchConversations) {
        refetchConversations();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeConversation?.id, refetchConversations, currentUserId]);

  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;
    return conversations.filter((conversation) => {
      const counterpart =
        conversation.buyer?.id === currentUserId
          ? conversation.seller
          : conversation.buyer;
      const propertyTitle = conversation.property?.title ?? "";
      const productTitle = conversation.product?.title ?? "";
      const haystack = `${
        counterpart?.name ?? ""
      } ${propertyTitle} ${productTitle}`.toLowerCase();
      return haystack.includes(searchTerm.toLowerCase());
    });
  }, [conversations, searchTerm, currentUserId]);

  // const handleSendMessage = useCallback(async () => {
  //   if (!newMessage.trim() || !activeConversation) return;

  //   try {
  //     const sendResult = await sendMessage({
  //       conversationId: activeConversation.id,
  //       message: newMessage.trim(),
  //       mediaUrl: undefined,
  //     }).unwrap();
  //     setMessages((prev) => {
  //       if (prev.some((msg) => msg.id === sendResult.message.id)) {
  //         return prev;
  //       }
  //       return [...prev, sendResult.message];
  //     });
  //     setNewMessage("");
  //     // refetchConversations();
  //   } catch {
  //     toast({
  //       title: "Unable to send message",
  //       description: "Please try again.",
  //       variant: "destructive",
  //     });
  //   }
  // }, [activeConversation, newMessage, sendMessage, toast]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !activeConversation) return;

    const text = newMessage.trim();

    // 1️⃣ Create temporary optimistic message
    const tempId = "temp-" + Date.now();
    const tempMessage: Message = {
      id: tempId,
      conversationId: activeConversation.id,
      message: text,
      senderId: currentUserId!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mediaUrl: undefined,
      type: "text",
    };

    // 2️⃣ Instantly show in UI (super fast instant message)
    setMessages((prev) => [...prev, tempMessage]);

    // Clear input immediately
    setNewMessage("");

    try {
      // 3️⃣ Send actual message to backend
      const sendResult = await sendMessage({
        conversationId: activeConversation.id,
        message: text,
        mediaUrl: undefined,
      }).unwrap();

      // 4️⃣ Replace temp message with real message
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? sendResult.message : msg)),
      );
    } catch {
      // Optional: mark failed message
      toast({
        title: "Unable to send message",
        description: "Please try again.",
        variant: "destructive",
      });

      // You can also remove the temp message if failed:
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    }
  }, [activeConversation, newMessage, sendMessage, toast, currentUserId]);

  const uploadAndSendAttachment = useCallback(
    async (file: File) => {
      if (!activeConversation) return;
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("zayanToken")
            : null;
        const uploadResponse = await fetch(UPLOAD_URL, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Upload failed");
        }

        const data = await uploadResponse.json();
        if (!data?.url) {
          throw new Error("Invalid upload response");
        }

        const isImage = file.type.startsWith("image/");
        const sendResponse = await sendMessage({
          conversationId: activeConversation.id,
          message: "",
          type: isImage ? "image" : "file",
          mediaUrl: data.url,
          fileName: file.name,
          mimeType: file.type,
        }).unwrap();

        setMessages((prev) => {
          if (prev.some((msg) => msg.id === sendResponse.message.id)) {
            return prev;
          }
          return [...prev, sendResponse.message];
        });

        if (currentUserId && refetchConversations) {
          refetchConversations();
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Attachment failed",
          description: "We couldn't upload that file. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        if (imageInputRef.current) {
          imageInputRef.current.value = "";
        }
      }
    },
    [
      activeConversation,
      sendMessage,
      refetchConversations,
      toast,
      currentUserId,
    ],
  );

  const handleAttachmentClick = (type: "image" | "file") => {
    if (isUploading) return;
    if (type === "image") {
      imageInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAndSendAttachment(file);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    // If it's a support chat, navigate to support page
    if (conversation.isSupportChat) {
      router.push(`${baseRoute}/support`);
      return;
    }
    setSelectedConversationId(conversation.id);
    router.push(`${baseRoute}/${conversation.id}`);
    if (!isDesktop) {
      setIsMobileListVisible(false);
    }
  };

  const handleShowConversationList = () => {
    if (!isDesktop) {
      setIsMobileListVisible(true);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2
          className="h-6 w-6 animate-spin"
          style={{ color: "#ef864c" }}
        />
      </div>
    );
  }

  if (isUserError || !currentUserId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-lg font-semibold text-foreground">
          You need to be logged in as a {currentUserLabel}.
        </p>
        <p className="text-sm text-muted-foreground">
          Please log in to access your conversations.
        </p>
      </div>
    );
  }

  const noConversations = !isConversationsLoading && conversations.length === 0;
  const showListPanel = isDesktop || isMobileListVisible;
  const showChatPanel = isDesktop || !isMobileListVisible;

  return (
    <div className={cn("flex w-full flex-col h-screen font-sans", className)}>
      {noConversations ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-[20px] border-0 bg-white shadow-2xl p-12 text-center max-w-2xl mx-auto my-auto h-fit">
          <div className="w-20 h-20 bg-[#ef864c]/10 rounded-[20px] flex items-center justify-center mb-6 text-[#ef864c]">
            <MessageCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-[#0f4656] tracking-tight">
            {emptyCopy?.title ?? "No conversations yet"}
          </h2>
          <p className="mt-4 text-base font-bold text-[#0f4656]/40 max-w-sm leading-relaxed">
            {emptyCopy?.description ??
              "Start a conversation from a property detail page to message interested users."}
          </p>
          <Button
            onClick={() => router.push("/real-estate/seller/properties")}
            className="mt-8 bg-[#0f4656] text-white rounded-[20px] h-14 px-10 font-black shadow-xl"
          >
            VIEW PORTFOLIO
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "flex h-full gap-0 overflow-hidden rounded-[20px] shadow-xl relative",
            isDesktop ? "bg-white border-0" : "bg-transparent shadow-none",
          )}
        >
          <div
            className={cn(
              "flex flex-col h-full overflow-hidden",
              isDesktop
                ? "w-72 lg:w-80 border-r border-[#0f4656]/5 bg-white"
                : "w-full bg-white rounded-[20px]",
              showListPanel ? "flex" : "hidden",
            )}
          >
            <div className="px-3 lg:px-4 py-3 lg:py-4 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h1 className="text-base lg:text-xl font-black text-[#0f4656]">
                    Inquiries
                  </h1>
                  <p className="text-[9px] lg:text-xs font-bold text-[#ef864c]/60 uppercase tracking-wide">
                    Real-time Activity
                  </p>
                </div>
                <Link
                  href={`${baseRoute}/support`}
                  className="p-2 lg:p-2.5 bg-[#ef864c]/10 rounded-[20px] text-[#ef864c] hover:bg-[#ef864c]/20 transition-all hover:scale-110 active:scale-95"
                >
                  <MessageCircle className="h-4 w-4 lg:h-5 lg:w-5" />
                </Link>
              </div>

              <div className="group relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-[#0f4656]/30 group-focus-within:text-[#ef864c] transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search interactions..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full h-9 lg:h-10 bg-[#0f4656]/5 border-2 border-transparent focus:border-[#ef864c]/20 focus:bg-white rounded-[20px] pl-10 pr-3 text-xs lg:text-sm font-bold text-[#0f4656] placeholder:text-[#0f4656]/30 transition-all outline-none shadow-inner"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isConversationsLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2
                    className="h-5 w-5 animate-spin"
                    style={{ color: "#ef864c" }}
                  />
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const isSupportChat = conversation.isSupportChat || false;
                  const counterpart = isSupportChat
                    ? { name: "Support Team", avatar: null } // Support chat indicator
                    : conversation.buyer?.id === currentUserId
                      ? conversation.seller
                      : conversation.buyer;
                  const isLastMessageMine =
                    conversation.lastMessageSenderId &&
                    conversation.lastMessageSenderId === currentUserId;
                  const previewText = conversation.lastMessage
                    ? `${isLastMessageMine ? "You: " : ""}${
                        conversation.lastMessage
                      }`
                    : "No messages yet";
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation)}
                      className={cn(
                        "w-full px-3 lg:px-4 py-2.5 lg:py-3 text-left transition-all duration-300 relative group border-b border-[#0f4656]/5",
                        selectedConversationId === conversation.id
                          ? "bg-[#ef864c]/10"
                          : "hover:bg-[#0f4656]/5 underline-offset-4",
                      )}
                    >
                      <div className="flex items-center gap-2 lg:gap-3">
                        <Avatar
                          name={counterpart?.name}
                          avatar={counterpart?.avatar ?? undefined}
                          size="w-9 h-9 lg:w-10 lg:h-10"
                          isActive={
                            counterpart &&
                            "lastSeen" in counterpart &&
                            counterpart.lastSeen
                              ? isUserActive(counterpart.lastSeen)
                              : false
                          }
                        />
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs lg:text-sm font-black text-[#0f4656] truncate">
                              {isSupportChat
                                ? "Support Team"
                                : (counterpart?.name ?? "Unknown User")}
                            </p>
                            <span className="text-[8px] lg:text-[9px] font-bold text-[#0f4656]/30 uppercase whitespace-nowrap">
                              {formatTime(conversation.updatedAt)}
                            </span>
                          </div>

                          {!isSupportChat &&
                            (conversation.property?.title ||
                              conversation.product?.title) && (
                              <div className="flex items-center gap-1 overflow-hidden">
                                <Building2 className="w-2.5 h-2.5 text-[#ef864c] shrink-0" />
                                <p className="truncate text-[9px] lg:text-[10px] font-bold text-[#ef864c]/80 uppercase tracking-wide">
                                  {conversation.property?.title ||
                                    conversation.product?.title}
                                </p>
                              </div>
                            )}

                          <p
                            className={cn(
                              "truncate text-[10px] lg:text-xs font-medium leading-tight",
                              !isLastMessageMine
                                ? "text-[#0f4656]/60"
                                : "text-[#0f4656]/40",
                            )}
                          >
                            {previewText}
                          </p>
                        </div>

                        {selectedConversationId === conversation.id && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#EF864C] rounded-l-full shadow-[0_0_15px_rgba(239,134,76,0.5)]" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div
            className={cn(
              "flex flex-1 flex-col bg-white",
              !showChatPanel && "hidden",
              !isDesktop && "w-full bg-transparent",
            )}
          >
            {activeConversation ? (
              <>
                {/* Premium Chat Header */}
                <div className="flex h-14 lg:h-16 items-center justify-between border-b border-[#0f4656]/5 px-3 lg:px-5 bg-white/80 backdrop-blur-xl shrink-0">
                  <div className="flex items-center gap-3 lg:gap-4 min-w-0">
                    {!isDesktop && !isMobileListVisible && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="-ml-2 text-[#ef864c] hover:bg-[#ef864c]/10 rounded-[20px]"
                        onClick={handleShowConversationList}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                    )}
                    <Avatar
                      name={partner?.name}
                      avatar={partner?.avatar ?? undefined}
                      size="w-9 h-9 lg:w-11 lg:h-11"
                      isActive={
                        partner?.lastSeen
                          ? isUserActive(partner.lastSeen)
                          : false
                      }
                    />
                    <div className="min-w-0">
                      <h2 className="text-sm lg:text-base font-black text-[#0f4656] truncate leading-tight">
                        {partner?.name ?? "Support Team"}
                      </h2>
                      <div className="flex items-center gap-1.5 lg:gap-2">
                        {partner?.lastSeen && (
                          <p className="text-[8px] lg:text-[10px] font-bold text-[#0f4656]/40 uppercase tracking-wide leading-tight">
                            {isUserActive(partner.lastSeen)
                              ? "Online Now"
                              : `Last seen ${formatLastSeen(partner.lastSeen)}`}
                          </p>
                        )}
                        {sellerResponseTime && (
                          <>
                            <div className="w-1 h-1 rounded-full bg-[#0f4656]/10" />
                            <p className="text-[8px] lg:text-[10px] font-bold text-[#ef864c]">
                              Replies in {sellerResponseTime}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 lg:gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#0f4656]/40 hover:text-[#ef864c] hover:bg-[#ef864c]/10 rounded-[20px] transition-all h-8 lg:h-10 w-8 lg:w-10 shrink-0 hidden sm:flex"
                    >
                      <Phone className="h-5 w-5 lg:h-6 lg:w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsReportModalOpen(true)}
                      className="text-[#0f4656]/40 hover:text-red-500 hover:bg-red-50 rounded-[20px] transition-all h-8 lg:h-10 w-8 lg:w-10 shrink-0"
                    >
                      <Flag className="h-4 w-4 lg:h-5 lg:w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#0f4656]/40 hover:text-[#0f4656] hover:bg-[#0f4656]/5 rounded-[20px] transition-all h-8 lg:h-10 w-8 lg:w-10 shrink-0"
                    >
                      <Info className="h-5 w-5 lg:h-6 lg:w-6" />
                    </Button>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 space-y-2 lg:space-y-3 overflow-y-auto bg-gradient-to-b from-white to-[#0f4656]/[0.02] p-3 lg:p-4 custom-scrollbar">
                  {isMessagesLoading ? (
                    <div className="flex flex-col h-full items-center justify-center space-y-4 opacity-40">
                      <Loader2 className="h-8 w-8 animate-spin text-[#ef864c]" />
                      <p className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-[#0f4656]">
                        Decrypting History
                      </p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col h-full items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 bg-[#0f4656]/5 rounded-full flex items-center justify-center text-[#0f4656]/20">
                        <MessageCircle className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-bold text-[#0f4656]/40 max-w-[200px]">
                        Start the conversation. Your data is encrypted.
                      </p>
                    </div>
                  ) : (
                    messages?.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex transition-all pointer-events-auto",
                          message.senderId === currentUserId
                            ? "justify-end"
                            : "justify-start",
                        )}
                      >
                        {(() => {
                          const isImageMessage =
                            Boolean(message.mediaUrl) &&
                            (message.type === "image" ||
                              message.mimeType?.startsWith("image/") ||
                              message.fileName?.match(
                                /\.(jpg|jpeg|png|gif|webp|svg)$/i,
                              ));

                          const isFileMessage =
                            Boolean(message.mediaUrl) &&
                            !isImageMessage &&
                            message.type === ("file" as Message["type"]);

                          return (
                            <div className="group/msg relative">
                              <div
                                className={cn(
                                  "max-w-xs md:max-w-md rounded-[20px] px-3 lg:px-4 py-2 lg:py-2.5 shadow-lg transition-all",
                                  message.senderId === currentUserId
                                    ? "rounded-br-none bg-gradient-to-br from-[#ef864c] to-[#d9723f] text-white shadow-[#ef864c]/20"
                                    : "rounded-bl-none bg-white border border-[#0f4656]/5 text-[#0f4656]",
                                )}
                              >
                                {message.message && (
                                  <p className="text-xs lg:text-sm font-medium leading-relaxed whitespace-pre-wrap">
                                    {message.message}
                                  </p>
                                )}

                                {isImageMessage && message.mediaUrl && (
                                  <div className="mt-3 space-y-2 overflow-hidden rounded-[20px] border-2 border-white/20 shadow-lg">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={message.mediaUrl}
                                      alt={
                                        message.fileName || "Image attachment"
                                      }
                                      className="h-48 lg:h-64 w-full object-cover"
                                    />
                                    <div className="px-3 py-2 bg-black/5 flex items-center justify-between gap-4">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-[#0f4656]/60 truncate">
                                        {getAttachmentLabel(
                                          message.fileName,
                                          message.mimeType,
                                        )}
                                      </span>
                                      <ArrowUpRight className="w-3.5 h-3.5 text-[#ef864c]" />
                                    </div>
                                  </div>
                                )}

                                {isFileMessage && message.mediaUrl && (
                                  <a
                                    href={message.mediaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                      "mt-3 flex items-center gap-3 rounded-[20px] border bg-white/10 backdrop-blur-md px-4 py-3 lg:py-4 transition-all hover:bg-white/20 hover:scale-[1.02]",
                                      message.senderId === currentUserId
                                        ? "border-white/20"
                                        : "border-[#0f4656]/10",
                                    )}
                                  >
                                    <div className="p-2 lg:p-3 bg-white/20 rounded-[20px]">
                                      <FileText className="h-5 w-5 lg:h-6 lg:w-6" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[10px] lg:text-xs font-black uppercase tracking-widest truncate">
                                        {getAttachmentLabel(
                                          message.fileName,
                                          message.mimeType,
                                        )}
                                      </p>
                                      <p className="text-[9px] lg:text-[10px] font-bold opacity-60">
                                        Vault Access Protocol
                                      </p>
                                    </div>
                                  </a>
                                )}

                                <div
                                  className={cn(
                                    "mt-2 flex items-center gap-2",
                                    message.senderId === currentUserId
                                      ? "text-white/40"
                                      : "text-[#0f4656]/30",
                                  )}
                                >
                                  <span className="text-[8px] lg:text-[9px] font-bold uppercase">
                                    {formatTime(message.createdAt)}
                                  </span>
                                  {message.senderId === currentUserId && (
                                    <CheckCircle2 className="w-3 h-3" />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div
                  className={cn(
                    "px-3 lg:px-4 py-3 lg:py-3 border-t border-[#0f4656]/5 bg-white relative shrink-0",
                    !isDesktop && "bg-transparent",
                  )}
                >
                  <div className="flex items-center gap-1.5 lg:gap-2 bg-[#0f4656]/5 lg:bg-white lg:border-2 border-[#0f4656]/5 lg:shadow-xl rounded-[20px] p-1.5 lg:p-2">
                    <div className="flex items-center gap-0.5 lg:gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#0f4656]/40 hover:text-[#ef864c] hover:bg-[#ef864c]/10 rounded-[20px] shrink-0"
                        onClick={() => handleAttachmentClick("image")}
                        disabled={isUploading || !activeConversation}
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ImageIcon className="h-5 w-5 lg:h-6 lg:w-6" />
                        )}
                      </Button>
                      <input
                        ref={imageInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#0f4656]/40 hover:text-[#ef864c] hover:bg-[#ef864c]/10 rounded-[20px] shrink-0"
                        onClick={() => handleAttachmentClick("file")}
                        disabled={isUploading || !activeConversation}
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <FileText className="h-5 w-5 lg:h-6 lg:w-6" />
                        )}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                        onChange={handleFileChange}
                      />
                    </div>

                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(event) => setNewMessage(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 border-0 bg-transparent text-xs lg:text-sm font-medium text-[#0f4656] placeholder:text-[#0f4656]/20 focus-visible:ring-0 focus-visible:ring-offset-0 h-9 lg:h-10"
                    />

                    <Button
                      size="icon"
                      className="bg-[#ef864c] hover:bg-[#d9723f] text-white rounded-[20px] h-9 lg:h-10 w-9 lg:w-10 shadow-lg shadow-[#ef864c]/30 shrink-0 transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-5 w-5 lg:h-6 lg:w-6" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-foreground/60">
                  Select a conversation to start messaging
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Chat Modal */}
      {activeConversation && (
        <ReportChatModal
          open={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          conversationId={activeConversation.id}
        />
      )}
    </div>
  );
}
