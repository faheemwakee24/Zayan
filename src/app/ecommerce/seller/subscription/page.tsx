import SubscriptionManagement from "@/components/pages/seller/SubscriptionManagement";
import SellerLayout from "@/components/SellerLayout";

export const dynamic = "force-dynamic";

export default function SubscriptionPage() {
  return (
    <SellerLayout>
      <SubscriptionManagement role="ecommerceSeller" />
    </SellerLayout>
  );
}

