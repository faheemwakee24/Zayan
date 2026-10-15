import BuyerMessages from "@/RealEstate/pages/buyer/Messages";

export const dynamic = 'force-dynamic';

interface BuyerConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function BuyerConversationPage({ params }: BuyerConversationPageProps) {
  const { conversationId } = await params;

  return <BuyerMessages conversationId={conversationId} />;
}


