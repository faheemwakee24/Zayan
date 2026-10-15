"use client";

import { useSearchParams } from "next/navigation";
import { ChatBoard } from "@/components/chat/ChatBoard";

interface SellerMessagesProps {
  conversationId?: string;
}

export default function SellerChat({ conversationId }: SellerMessagesProps = {}) {
  const searchParams = useSearchParams();
  const conversationIdFromParams = searchParams?.get("id") || conversationId;

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ChatBoard
          role="ecommerce_seller"
          conversationId={conversationIdFromParams}
          className="h-[calc(100vh-12rem)]"
          emptyCopy={{
            title: "You don't have any buyer chats yet",
            description:
              "Once buyers reach out from a product page you'll see the conversations here instantly.",
          }}
        />
      </div>
    </div>
  );
}
