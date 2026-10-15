"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";
import { useChatAssistantMutation, useCheckAiAvailabilityQuery } from "@/services/redux/api/aiApi";
import { toast } from "sonner";

interface ChatAssistantProps {
  itemType: "product" | "property";
  itemInfo: {
    [key: string]: any; // Flexible item information
  };
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatAssistant({ itemType, itemInfo }: ChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: aiAvailability } = useCheckAiAvailabilityQuery();
  const [chatAssistant] = useChatAssistantMutation();
  const isAiAvailable = aiAvailability?.available ?? false;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !isAiAvailable) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const result = await chatAssistant({
        itemType,
        question: userMessage,
        ...itemInfo,
      }).unwrap();

      if (result.answer && result.available) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: result.answer || "" },
        ]);
      } else {
        toast.error(result.message || "Failed to get AI response");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I couldn't process your question. Please try again.",
          },
        ]);
      }
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || err?.message || "Failed to get AI response";
      toast.error(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isAiAvailable) {
    return null; // Don't show chat assistant if AI is not available
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50 bg-primary hover:bg-primary/90"
          size="lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col border-2 border-primary">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-semibold">AI Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-primary/80"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  Ask me anything about this {itemType === "product" ? "product" : "property"}!
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-white"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-background rounded-b-lg">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="sm"
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              AI-powered assistant • Responses may vary
            </p>
          </div>
        </Card>
      )}
    </>
  );
}

