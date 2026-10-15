import SellerOrders from "@/components/pages/seller/Orders";
import SellerLayout from "@/components/SellerLayout";

export const dynamic = 'force-dynamic';


export default function SellerOrdersPage() {
  return (
    <SellerLayout>
      <SellerOrders />
    </SellerLayout>
  );
}

