import SellerChat from "@/components/pages/seller/SellerChat";
import SellerLayout from "@/components/SellerLayout";

export const dynamic = 'force-dynamic';

interface SellerMessagesPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function SellerMessagesPage({ params }: SellerMessagesPageProps) {
  const { conversationId } = await params;
  
  return (
    <SellerLayout>
      <SellerChat conversationId={conversationId} />
    </SellerLayout>
  );
}

