import Messages from "@/components/pages/buyer/Messages";
import { EcommerceBuyerLayout } from "@/components/EcommerceBuyerLayout";

export const dynamic = 'force-dynamic';

export default function MessagesPage() {
  return (
    <EcommerceBuyerLayout>
      <Messages />
    </EcommerceBuyerLayout>
  );
}

