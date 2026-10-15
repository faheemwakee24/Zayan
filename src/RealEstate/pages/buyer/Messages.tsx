'use client'

import { BuyerDashboardLayout } from "@/RealEstate/components/BuyerDashboardLayout";
import { ChatBoard } from "@/RealEstate/components/chat/ChatBoard";

interface BuyerMessagesProps {
  conversationId?: string;
}

export default function BuyerMessages({ conversationId }: BuyerMessagesProps = {}) {
  return (
    <BuyerDashboardLayout>
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <ChatBoard
          role="realestate_buyer"
          conversationId={conversationId}
          className="h-[calc(100vh-12rem)]"
          emptyCopy={{
            title: "No buyer conversations yet",
            description:
              "Use the &quot;Send Message&quot; action on a property page whenever you contact a seller.",
          }}
        />
      </div>
    </BuyerDashboardLayout>
  );
}

