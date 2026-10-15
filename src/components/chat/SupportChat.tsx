"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, MessageCircle, HeadphonesIcon, CheckCircle2 } from "lucide-react";
import {
  useGetSupportConversationQuery,
  useSendSupportMessageMutation,
} from "@/services/redux/api/chatApi";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SupportChatProps {
  className?: string;
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const formatFullTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function SupportChat({ className }: SupportChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  const {
    data: supportData,
    isLoading,
    refetch,
  } = useGetSupportConversationQuery();

  const [sendSupportMessage] = useSendSupportMessageMutation();

  const conversation = supportData?.conversation;
  const messages = supportData?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    try {
      await sendSupportMessage({
        conversationId: conversation.id,
        message: messageText,
        type: "text",
      }).unwrap();

      // Refetch to get updated messages
      refetch();
    } catch (error: any) {
      toast({
        title: "Failed to send message",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
      setNewMessage(messageText); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-[#0f4656] to-[#0f4656] border-b border-[#0f4656]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <HeadphonesIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">Support Team</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-xs text-white/80">Online • Usually replies within minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-800">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0f4656] to-[#ef864c] flex items-center justify-center mb-6 shadow-lg">
              <MessageCircle className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#0f4656' }}>
              Start a Conversation
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
              No messages yet. Send us a message and our support team will get back to you as soon as possible!
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const senderId = typeof message.senderId === 'string' 
              ? message.senderId 
              : (message.senderId as any)?._id || message.senderId;
            const buyerId = typeof conversation?.buyerId === 'string' 
              ? conversation?.buyerId 
              : (conversation?.buyerId as any)?._id || conversation?.buyerId;
            const isUser = senderId === buyerId;
            const isAdmin = (message as any).isAdmin === true || (message as any).isAdminMessage === true;

            // Check if we should show date separator
            const showDateSeparator = index === 0 || 
              (new Date(message.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString());

            return (
              <div key={message.id}>
                {showDateSeparator && (
                  <div className="flex items-center justify-center my-4">
                    <div className="px-4 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(message.createdAt).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                )}
                <div
                  className={cn(
                    "flex gap-3",
                    isUser ? "justify-end" : "justify-start"
                  )}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0f4656] to-[#ef864c] flex items-center justify-center flex-shrink-0 shadow-md">
                      <HeadphonesIcon className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="flex flex-col max-w-[75%]">
                    {!isUser && (
                      <p className="text-xs font-semibold mb-1 px-1" style={{ color: '#0f4656' }}>
                        Support Team
                      </p>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 shadow-sm",
                        isUser
                          ? "bg-gradient-to-r from-[#0f4656] to-[#0f4656] text-white"
                          : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.message || ""}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <p className={cn(
                          "text-xs",
                          isUser ? "text-white/70" : "text-gray-500 dark:text-gray-400"
                        )}>
                          {formatFullTime(message.createdAt)}
                        </p>
                        {isUser && (
                          <CheckCircle2 className="w-3 h-3 text-white/70" />
                        )}
                      </div>
                    </div>
                  </div>
                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ef864c] to-[#ef864c] flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-xs font-bold text-white">
                        {typeof conversation?.buyerId === 'object' && (conversation.buyerId as any)?.name 
                          ? (conversation.buyerId as any).name.charAt(0).toUpperCase()
                          : 'U'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f4656] focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              disabled={isSending || !conversation}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending || !conversation}
            className="px-6 py-3 bg-gradient-to-r from-[#ef864c] to-[#ef864c] hover:from-[#d9723f] hover:to-[#d9723f] text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Send</span>
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Our support team typically responds within a few minutes
        </p>
      </div>
    </div>
  );
}

