import SellerMessages from "@/RealEstate/pages/seller/Messages";

export const dynamic = 'force-dynamic';

interface SellerConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function SellerConversationPage({ params }: SellerConversationPageProps) {
  const { conversationId } = await params;

  return <SellerMessages conversationId={conversationId} />;
}


