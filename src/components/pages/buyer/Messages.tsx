"use client";

import { useSearchParams } from "next/navigation";
import { ChatBoard } from "@/components/chat/ChatBoard";

interface BuyerMessagesProps {
  conversationId?: string;
}

export default function Messages({ conversationId }: BuyerMessagesProps = {}) {
  const searchParams = useSearchParams();
  const conversationIdFromParams = searchParams?.get("id") || conversationId;

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ChatBoard
        role="ecommerce_buyer"
        conversationId={conversationIdFromParams}
        className="h-[calc(100vh-12rem)]"
        emptyCopy={{
          title: "No conversations yet",
          description:
            "Use the \"Chat\" button on a product page whenever you want to contact a seller.",
        }}
      />
    </div>
  );
}
