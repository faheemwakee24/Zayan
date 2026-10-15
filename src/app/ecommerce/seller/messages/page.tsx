import SellerChat from "@/components/pages/seller/SellerChat";
import SellerLayout from "@/components/SellerLayout";

export const dynamic = 'force-dynamic';


export default function SellerMessagesPage() {
  return (
    <SellerLayout>
      <SellerChat />
    </SellerLayout>
  );
}

