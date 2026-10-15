"use client";

import { DashboardLayout } from "@/RealEstate/components/DashboardLayout";
import { ChatBoard } from "@/RealEstate/components/chat/ChatBoard";

interface SellerMessagesProps {
  conversationId?: string;
}

export default function SellerMessages({
  conversationId,
}: SellerMessagesProps = {}) {
  return (
    <DashboardLayout>
      <div className="h-full p-3 lg:p-8 max-w-7xl mx-auto">
        <ChatBoard
          role="realestate_seller"
          conversationId={conversationId}
          className="h-full shadow-2xl rounded-3xl lg:rounded-[40px] border-0"
          emptyCopy={{
            title: "No inquiries yet",
            description:
              "Syncing with the marketplace. Your buyer conversations will appear here in real-time.",
          }}
        />
      </div>
    </DashboardLayout>
  );
}
