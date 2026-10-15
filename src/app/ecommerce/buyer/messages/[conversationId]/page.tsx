import Messages from "@/components/pages/buyer/Messages";
import { EcommerceBuyerLayout } from "@/components/EcommerceBuyerLayout";

export const dynamic = 'force-dynamic';

interface MessagesPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function MessagesPage({ params }: MessagesPageProps) {
  const { conversationId } = await params;
  
  return (
    <EcommerceBuyerLayout>
      <Messages conversationId={conversationId} />
    </EcommerceBuyerLayout>
  );
}

