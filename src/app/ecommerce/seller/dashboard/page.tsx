import SellerDashboard from "@/components/pages/seller/SellerDashboard";
import SellerLayout from "@/components/SellerLayout";

export const dynamic = 'force-dynamic';

export default function SellerDashboardPage() {
  return (
    <SellerLayout>
      <SellerDashboard />
    </SellerLayout>
  );
}

