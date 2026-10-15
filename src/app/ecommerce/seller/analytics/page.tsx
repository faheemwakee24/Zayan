import SellerAnalytics from "@/components/pages/seller/Analytics";
import SellerLayout from "@/components/SellerLayout";

export const dynamic = 'force-dynamic';


export default function SellerAnalyticsPage() {
  return (
    <SellerLayout>
      <SellerAnalytics />
    </SellerLayout>
  );
}

